import mongoose from "mongoose";

const opcionSchema = new mongoose.Schema({
    texto: { type: String, required: true },
}, { _id: false });

const preguntaSchema = new mongoose.Schema({
    enunciado: { type: String, required: true },
    opciones: { type: [opcionSchema], required: true },   
    correcta: { type: Number, required: true, min: 0, max: 3 }, 
}, { _id: false });

const examenSchema = new mongoose.Schema({
    tutor_id:      { type: Number, required: true },      
    nombre:        { type: String, required: true },
    clase:         { type: Number, required: true },
    duracion:      { type: Number, required: true },
    fecha_limite:  { type: Date,   required: true },
    preguntas:     { type: [preguntaSchema], default: [] },
    creado_en:     { type: Date, default: Date.now },
    calificacion:  { type: Number },
    retro:         { type: String },
});

export default mongoose.model("Examen", examenSchema);
