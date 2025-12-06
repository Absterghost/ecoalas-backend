import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const usuarioSchema = new mongoose.Schema({
  nombreUsuario: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio'],
    unique: true,
    trim: true,
    minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres']
  },
  contrasena: {
    type: String,
    required: [true, 'La contrasena es obligatoria'],
    minlength: [6, 'La contrasena debe tener al menos 6 caracteres'],
    select: false // No devolver la contrasena en las consultas por defecto
  },
  rol: {
    type: String,
    enum: ['usuario', 'admin'],
    default: 'usuario'
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Anade createdAt y updatedAt automaticamente
});

// Middleware para hashear la contrasena antes de guardar
usuarioSchema.pre('save', async function() {
  if (!this.isModified('contrasena')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.contrasena = await bcrypt.hash(this.contrasena, salt);
});

// Metodo para comparar contrasenas
usuarioSchema.methods.compararContrasenas = async function(contrasenaIngresada) {
  return await bcrypt.compare(contrasenaIngresada, this.contrasena);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
