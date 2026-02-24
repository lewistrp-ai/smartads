import React, { useState } from 'react';

const quizData = [
    {
        category: "Fundamentos",
        questions: [
            {
                id: "f1",
                question: "Si tu objetivo es vender directamente en una tienda online, ¿qué objetivo debes elegir en Meta Ads?",
                options: [
                    { text: "Interacción", isCorrect: false, explanation: "Interacción solo busca likes, comentarios o mensajes, pero no optimiza para que la persona pase la tarjeta en tu web." },
                    { text: "Tráfico", isCorrect: false, explanation: "Tráfico busca clics baratos. Meta enviará a las personas que hacen más clics, pero que rara vez compran." },
                    { text: "Ventas", isCorrect: true, explanation: "¡Correcto! El objetivo de Ventas (o Conversiones) le dice al píxel que busque a las personas con mayor probabilidad de comprar en tu tienda." },
                    { text: "Reconocimiento", isCorrect: false, explanation: "Reconocimiento es para branding (que te vean muchas veces). No está optimizado para generar ventas." }
                ]
            },
            {
                id: "f2",
                question: "¿Qué es el Píxel de Meta?",
                options: [
                    { text: "Un formato de anuncio de imagen cuadrada.", isCorrect: false, explanation: "Eso es simplemente un formato de diseño, no el Píxel." },
                    { text: "Un código que rastrea el comportamiento de los usuarios en tu web.", isCorrect: true, explanation: "¡Exacto! El Píxel registra qué hacen las personas en tu sitio web (visitas, carritos, compras) y le enseña a Meta a buscar clientes similares." },
                    { text: "La cámara que usa Instagram para grabar Reels.", isCorrect: false, explanation: "Nada que ver. El píxel es software de rastreo." },
                    { text: "Un tipo de segmentación de público.", isCorrect: false, explanation: "Aunque alimenta a los públicos, el píxel en sí es la herramienta de rastreo, no el público." }
                ]
            }
        ]
    },
    {
        category: "Estructura",
        questions: [
            {
                id: "e1",
                question: "¿Dónde se define el presupuesto diario de una campaña si NO usas CBO (Advantage+ Campaign Budget)?",
                options: [
                    { text: "A nivel de Campaña", isCorrect: false, explanation: "Si no usas CBO, el presupuesto no se pone en la campaña." },
                    { text: "A nivel de Conjunto de Anuncios (ABO)", isCorrect: true, explanation: "¡Correcto! En ABO (Ad Set Budget Optimization), tú asignas manualmente cuánto gasta cada conjunto de anuncios." },
                    { text: "A nivel de Anuncio", isCorrect: false, explanation: "Meta no permite poner límites de presupuesto a nivel de un anuncio individual." },
                    { text: "A nivel de la Cuenta Publicitaria", isCorrect: false, explanation: "El límite de la cuenta es global, pero el presupuesto diario operativo se define en el conjunto de anuncios." }
                ]
            }
        ]
    },
    {
        category: "Métricas",
        questions: [
            {
                id: "m1",
                question: "Si tu CTR (Click Through Rate) está en 0.4% y tu CPC está por las nubes, ¿dónde está el problema principal?",
                options: [
                    { text: "La Landing Page es mala", isCorrect: false, explanation: "El CTR mide lo que pasa ANTES de llegar a la landing page. Si no hacen clic, la landing no tiene la culpa (aún)." },
                    { text: "El botón de compra no funciona", isCorrect: false, explanation: "Esto afectaría tu Tasa de Conversión, no tu CTR." },
                    { text: "El Anuncio (Creativo/Copy) no llama la atención", isCorrect: true, explanation: "¡Bien! Un CTR tan bajo significa que la gente ve el anuncio (scroll) pero lo ignora. Necesitas cambiar el video, la imagen o el gancho principal." },
                    { text: "El presupuesto es muy bajo", isCorrect: false, explanation: "El presupuesto afecta el Alcance, no necesariamente el porcentaje de personas que hacen clic al verlo." }
                ]
            },
            {
                id: "m2",
                question: "Si tu CPA (Costo por Compra) es de $30 USD y tu producto deja un margen de $20 USD, ¿qué está pasando?",
                options: [
                    { text: "Estupendo, la campaña es un éxito.", isCorrect: false, explanation: "¡Estás perdiendo dinero! Si te cuesta 30 vender algo que te da 20, estás en saldo negativo de -10." },
                    { text: "Estás perdiendo $10 USD por cada venta.", isCorrect: true, explanation: "¡Exacto! Tu CPA es mayor que tu margen comercial. Tienes que apagar o ajustar esa campaña urgentemente." },
                    { text: "Tu ROAS es infinito.", isCorrect: false, explanation: "El ROAS sería muy bajo en este escenario." },
                    { text: "Meta está fallando el cobro.", isCorrect: false, explanation: "No es un fallo de Meta, es que el costo de adquirir tráfico que convierte está saliendo muy caro." }
                ]
            }
        ]
    }
];

const Quizzes = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const handleCategorySelect = (idx) => {
        setSelectedCategory(idx);
        setCurrentQuestionIndex(0);
        setSelectedAnswerIndex(null);
        setIsAnswered(false);
        setScore(0);
        setShowResults(false);
    };

    const handleAnswerClick = (optionIndex) => {
        if (isAnswered) return; // Prevent changing answer

        setSelectedAnswerIndex(optionIndex);
        setIsAnswered(true);

        const isCorrect = quizData[selectedCategory].questions[currentQuestionIndex].options[optionIndex].isCorrect;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        const questions = quizData[selectedCategory].questions;
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswerIndex(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
        }
    };

    const resetQuiz = () => {
        handleCategorySelect(selectedCategory);
    };

    if (selectedCategory === null) {
        return (
            <div className="quiz-container animate-fade-in">
                <h3 style={{ marginBottom: '1.5rem' }}>Selecciona un Módulo para Evaluarte</h3>
                <div className="grid grid-cols-2 gap-4">
                    {quizData.map((cat, idx) => (
                        <div
                            key={idx}
                            className="card"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                            onClick={() => handleCategorySelect(idx)}
                        >
                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{cat.category}</h4>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {cat.questions.length} preguntas
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const currentQuestions = quizData[selectedCategory].questions;
    const currentQ = currentQuestions[currentQuestionIndex];

    if (showResults) {
        return (
            <div className="quiz-results card animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>
                    {score === currentQuestions.length ? '🏆' : '👍'}
                </span>
                <h2 style={{ marginBottom: '0.5rem' }}>¡Módulo Completado!</h2>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Puntaje: <strong style={{ color: 'white' }}>{score} de {currentQuestions.length}</strong> correctas.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn-secondary" onClick={() => setSelectedCategory(null)}>Elegir otro módulo</button>
                    <button className="btn" onClick={resetQuiz}>Reintentar Módulo</button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-active-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>Módulo: {quizData[selectedCategory].category}</h3>
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                    Pregunta {currentQuestionIndex + 1} de {currentQuestions.length}
                </span>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.4rem', lineHeight: '1.4', marginBottom: '2rem' }}>{currentQ.question}</h2>

                <div className="options-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {currentQ.options.map((opt, idx) => {
                        let buttonStyle = {
                            textAlign: 'left',
                            padding: '1rem',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            transition: 'all 0.2s',
                            cursor: isAnswered ? 'default' : 'pointer'
                        };

                        if (isAnswered) {
                            if (opt.isCorrect) {
                                buttonStyle.background = 'rgba(16, 185, 129, 0.2)';
                                buttonStyle.borderColor = 'var(--success)';
                            } else if (idx === selectedAnswerIndex) {
                                buttonStyle.background = 'rgba(239, 68, 68, 0.2)';
                                buttonStyle.borderColor = 'var(--warning)';
                            } else {
                                buttonStyle.opacity = '0.5';
                            }
                        }

                        return (
                            <button
                                key={idx}
                                className="quiz-option"
                                style={buttonStyle}
                                onClick={() => handleAnswerClick(idx)}
                                disabled={isAnswered}
                            >
                                {opt.text}
                            </button>
                        );
                    })}
                </div>

                {isAnswered && (
                    <div className="explanation-box animate-fade-in" style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderLeft: '4px solid var(--primary)',
                        borderRadius: '0.5rem'
                    }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {currentQ.options[selectedAnswerIndex].isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto'}
                        </h4>
                        <p style={{ margin: 0, lineHeight: '1.5', color: 'rgba(255,255,255,0.9)' }}>
                            {currentQ.options[selectedAnswerIndex].explanation}
                        </p>

                        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                            <button className="btn" onClick={handleNextQuestion}>
                                {currentQuestionIndex < currentQuestions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quizzes;
