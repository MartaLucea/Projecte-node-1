import bcrypt from 'bcryptjs'
import DBLocal from 'db-local'
import crypto from 'node:crypto'
import { SALT_ROUNDS } from './config.js'
const {Schema}=new DBLocal({path:'./db'})

//Creem un esquema per les dades amb els camps especificats.
const User = Schema('User',{
    _id:{type:String,required:true},
    username:{type:String,required:true},
    password:{type:String,required:true}
})

// exportem en una classe per crear usuaris i fer login
export class UserRepository{
    static async create({username,password}){
        //1. Validació opcional usar zod(biblioteca de validaciones)
        //S'haria de fer mes estricte
        Validation.username(username)
        Validation.password(password)
        //2. Asegurarse que el username noooo existe
        const user=User.findOne({username})
        if (user) throw new Error("L'usuari ja existeix")

        //3.Creamos un id si fuera base de datos normal, 
        // mejor que lo genere la base de datos
        const id=crypto.randomUUID()
        //salt row el valor 10 se utiliza para encryptar, más valor añade complejidad i mas tiempo
        //hash devuelve una promesa, por eso hay que utilizar await y declarar la funcion como async
        const hashedPassword=await bcrypt.hash(password,SALT_ROUNDS)
        //4. Creamos el usario
        User.create({
            _id:id,
            username,
            password:hashedPassword
        }).save()
        return id
    }
    static async login({username,password}){
        Validation.username(username)
        Validation.password(password)
        //2. Asegurarse que el username existe
        const user=User.findOne({username})
        // Si no existe error (el mateix missatge que amb la contrasenya, per no donar pistes)
        if(!user) throw new Error('Usuari o contrasenya incorrectes')
        //no lo desencripta para compararlo    
        const isValid=await bcrypt.compare(password,user.password)
        
        if (!isValid) throw new Error('Usuari o contrasenya incorrectes')
        //Per no enviar el password copiem tot el contingut menys el password
        const {password:_,...publicUser}=user

        return publicUser
    }
   
}
class Validation {
    static username(username){
        if(typeof username != 'string') throw new Error("El nom d'usuari ha de ser text");
        if(username.length < 3) throw new Error("El nom d'usuari ha de tenir almenys 3 caràcters");

    }
    static password(password){
        if(typeof password != 'string') throw new Error('La contrasenya ha de ser text');
        if(password.length < 6) throw new Error('La contrasenya ha de tenir almenys 6 caràcters');
    }
}