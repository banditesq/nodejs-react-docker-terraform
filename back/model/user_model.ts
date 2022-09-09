import mongoose, { mongo } from 'mongoose';
const { Schema } = mongoose;

const usersSchema = new Schema({
 _id : {type :mongoose.Types.ObjectId,default:mongoose.Types.ObjectId},
 email : {type: String, required: true,unique:true},
 first_name: {type: String, required: true},
 last_name: {type: String, required: true},
 password : {type: String,required: true}
});
var User = mongoose.model('User', usersSchema);

export default User
