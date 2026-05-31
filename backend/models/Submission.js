import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  examen_id:    { type: mongoose.Schema.Types.ObjectId, ref: "Examen", required: true },
  student_id:   { type: Number, required: true },
  respuestas:   { type: [Number], required: true }, 
  calificacion: { type: Number },
  retro:        { type: String, default: "" },
  enviado_en:   { type: Date, default: Date.now },
});

submissionSchema.index({ examen_id: 1, student_id: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);
