import "./tutor-material.css"

function Material() {
    return (
        <div className="material">
            <div className="line-material"></div>
            <div className="material-content">
                <div className="material-left">
                    <div className="type-material">
                        <div className="type all">
                            <p>Todos</p>
                        </div>
                        <div className="type">
                            <p>Inglés A</p>
                        </div>
                        <div className="type">
                            <p>Inglés B</p>
                        </div>
                    </div>

                    <div className="material-title">
                        <h2>Material Publicado</h2>
                    </div>

                    <div className="material-info">
                        <div className="material-side">
                            <div className="material-data">
                                <h3>Guía del verbo to be</h3>
                                <p>PDF - Inglés A</p>
                                <div className="material-button">
                                    <p>Ver material</p>
                                </div>
                            </div>
                            <div className="material-data">
                                <h3>Audio Pronunciación</h3>
                                <p>Video - Inglés B</p>
                                <div className="material-button">
                                    <p>Ver material</p>
                                </div>
                            </div>
                        </div>
                        <div className="material-side">
                            <div className="material-data">
                                <h3>Video de Conjugación</h3>
                                <p>Video - Inglés A</p>
                                <div className="material-button">
                                    <p>Ver material</p>
                                </div>
                            </div>
                            <div className="material-data">
                                <h3>Video números y colores</h3>
                                <p>Enlace externo - Inglés B</p>
                                <div className="material-button">
                                    <p>Ver material</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="material-right">
                    <h2>Subir Nuevo Material</h2>
                    <div className="exam-form">
                        <p>Titulo material</p>
                        <div className="space-form">
                            <p>Ej:Lección 3</p>
                        </div>
                    </div>

                    <div className="exam-form">
                         <p>Tipo de material</p>
                        <div className="space">
                            <div className="left-space">
                                <div className="space-form">
                                    <p>PDF/Doc</p>
                                </div>
                            </div>
                            <div className="right-space">
                                <div className="space-form">
                                    <p>Enlace</p>
                                </div>
                            </div> 
                        </div>
                    </div>

                    <div className="exam-form">
                        <div className="space">
                            <div className="left-space">
                                <div className="space-form">
                                    <p>Imagen</p>
                                </div>
                            </div>
                            <div className="right-space">
                                <div className="space-form">
                                    <p>Video</p>
                                </div>
                            </div> 
                        </div>
                    </div>

                    <div className="document">
                        <p>Haz Click para adjuntar un archivo o arrastra un 
                            archivo aquí PDF, Word, Imagen,  Video o Enlace</p>
                    </div>

                    <div className="exam-form">
                        <p>Clase</p>
                        <div className="space-form">
                            <p>Ej:Inglés A</p>
                        </div>
                    </div>

                    <div className="material-save">
                        <p>Publicar Material</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Material;