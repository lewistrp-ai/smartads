import React, { useEffect } from 'react';
import '../styles/landing-whatsapp.css';

/**
 * Landing — Taller de Ventas por WhatsApp
 * Construida desde cero, inspirada en el taller de Lewis Pineda.
 */

const Check = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const WhatsappIcon = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.52 3.48A11.78 11.78 0 0 0 12 0C5.37 0 .02 5.35.02 11.98c0 2.11.55 4.17 1.6 5.99L0 24l6.2-1.63a11.96 11.96 0 0 0 5.8 1.48h.01c6.62 0 11.97-5.35 11.97-11.97 0-3.2-1.24-6.2-3.46-8.4ZM12 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.22-3.68.97.98-3.59-.23-.37A9.82 9.82 0 1 1 21.8 12a9.8 9.8 0 0 1-9.8 9.8Zm5.37-7.34c-.29-.14-1.74-.86-2-.96-.27-.1-.47-.14-.67.14-.19.29-.76.96-.94 1.16-.17.19-.34.22-.63.08-.29-.14-1.24-.46-2.36-1.46-.87-.78-1.46-1.74-1.63-2.03-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.51.15-.17.19-.29.29-.48.1-.2.05-.36-.02-.51-.07-.14-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51H8.1c-.19 0-.5.07-.77.36-.26.29-1 .98-1 2.39 0 1.41 1.03 2.78 1.17 2.97.14.19 2.02 3.08 4.9 4.32.69.3 1.22.47 1.64.61.69.22 1.32.19 1.81.12.55-.08 1.74-.71 1.98-1.4.24-.69.24-1.28.17-1.4-.07-.13-.26-.2-.55-.34Z" />
    </svg>
);

const waCta = 'https://wa.me/5215555555555?text=Hola%20Lewis,%20quiero%20inscribirme%20al%20Taller%20de%20Ventas%20por%20WhatsApp';

export default function LandingTallerWhatsApp() {
    useEffect(() => {
        const prev = document.title;
        document.title = 'Taller de Ventas por WhatsApp — Lewis Pineda';
        return () => { document.title = prev; };
    }, []);

    return (
        <div className="lwa-page">
            {/* ================= NAV ================= */}
            <nav className="lwa-nav">
                <div className="lwa-container lwa-nav__inner">
                    <div className="lwa-brand">
                        <div className="lwa-brand__logo">
                            <WhatsappIcon size={18} />
                        </div>
                        <span>Lewis Pineda <span style={{ color: '#25d366' }}>/ Taller</span></span>
                    </div>
                    <a href="#precio" className="lwa-nav__cta">
                        Inscribirme
                    </a>
                </div>
            </nav>

            {/* ================= HERO ================= */}
            <header className="lwa-hero">
                <div className="lwa-container lwa-hero__grid">
                    <div>
                        <span className="lwa-pill">
                            <span className="dot"></span>
                            Nueva edición · Cupos limitados
                        </span>
                        <h1>
                            Convierte tu <span className="hl">WhatsApp</span> en una máquina de cerrar ventas
                        </h1>
                        <p className="lead">
                            Aprende el sistema paso a paso para atender, calificar y vender por WhatsApp Business
                            de forma profesional — sin sonar desesperado, sin perder chats y sin depender de la
                            suerte. Pensado para dueños de negocio, vendedores y emprendedores en LATAM.
                        </p>
                        <div className="lwa-hero__ctas">
                            <a href="#precio" className="lwa-btn lwa-btn--primary">
                                <WhatsappIcon size={20} />
                                Quiero inscribirme al taller
                            </a>
                            <a href="#temario" className="lwa-btn lwa-btn--ghost">
                                Ver temario
                            </a>
                        </div>
                        <div className="lwa-trust">
                            <span><Check size={16} /> +500 alumnos</span>
                            <span><Check size={16} /> Acceso 100% online</span>
                            <span><Check size={16} /> Plantillas incluidas</span>
                        </div>
                    </div>

                    {/* Mock chat art */}
                    <div className="lwa-chat" aria-hidden="true">
                        <div className="lwa-chat__header">
                            <div className="lwa-chat__avatar">LP</div>
                            <div>
                                <div className="lwa-chat__name">Lewis Pineda</div>
                                <div className="lwa-chat__status">en línea</div>
                            </div>
                        </div>
                        <div className="lwa-chat__body">
                            <div className="lwa-bubble lwa-bubble--in">
                                Hola 👋 Vi tu anuncio, ¿me puedes dar más info?
                                <time>10:02</time>
                            </div>
                            <div className="lwa-bubble lwa-bubble--out">
                                ¡Hola! Claro que sí. Antes de recomendarte una opción, cuéntame:
                                ¿para qué lo necesitas?
                                <time>10:02</time>
                            </div>
                            <div className="lwa-bubble lwa-bubble--in">
                                Es para mi negocio, quiero cerrar más ventas.
                                <time>10:03</time>
                            </div>
                            <div className="lwa-bubble lwa-bubble--out">
                                Perfecto ✅ Te preparé una propuesta corta,
                                ¿la revisamos en 2 minutos?
                                <time>10:03</time>
                            </div>
                            <div className="lwa-bubble lwa-bubble--in">
                                Sí, envíamela 🙌
                                <time>10:04</time>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ================= PAIN ================= */}
            <section className="lwa-section lwa-section--soft">
                <div className="lwa-container">
                    <div className="lwa-section__head--center" style={{ marginBottom: 40 }}>
                        <div className="lwa-eyebrow">¿Te suena familiar?</div>
                        <h2 className="lwa-title">Tu WhatsApp recibe mensajes… pero las ventas no llegan</h2>
                        <p className="lwa-subtitle">
                            La mayoría de negocios pierden hasta 7 de cada 10 clientes por una sola razón:
                            no tienen un proceso claro para vender por chat.
                        </p>
                    </div>

                    <div className="lwa-grid lwa-grid--3">
                        <div className="lwa-card">
                            <div className="lwa-icon lwa-icon--red">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </svg>
                            </div>
                            <h3>Clientes que "lo piensan" y desaparecen</h3>
                            <p>
                                Respondes, das el precio y el prospecto se esfuma. Nunca supiste qué pasó
                                ni cómo recuperarlo.
                            </p>
                        </div>
                        <div className="lwa-card">
                            <div className="lwa-icon lwa-icon--red">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <h3>Horas atendiendo chats sin cerrar</h3>
                            <p>
                                Pasas el día pegado al celular copiando y pegando el mismo mensaje una
                                y otra vez, sin un sistema que venda por ti.
                            </p>
                        </div>
                        <div className="lwa-card">
                            <div className="lwa-icon lwa-icon--red">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 9v2m0 4h.01"></path>
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                </svg>
                            </div>
                            <h3>Inviertes en publicidad y no vendes</h3>
                            <p>
                                Los anuncios traen prospectos, pero tu WhatsApp no los convierte. Te sientes
                                tirando el dinero a la basura.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= SOLUTION ================= */}
            <section className="lwa-section">
                <div className="lwa-container">
                    <div className="lwa-section__head--center" style={{ marginBottom: 50 }}>
                        <div className="lwa-eyebrow">La solución</div>
                        <h2 className="lwa-title">
                            Un sistema probado para vender por WhatsApp — sin improvisar
                        </h2>
                        <p className="lwa-subtitle">
                            En el Taller de Ventas por WhatsApp te llevo de la mano para instalar el proceso que
                            usan marcas, negocios y profesionales para atender mejor, calificar más rápido y
                            cerrar ventas con naturalidad.
                        </p>
                    </div>

                    <ul className="lwa-benefits">
                        <li>
                            <Check />
                            <div>
                                <strong>Saludo profesional que genera confianza</strong>
                                <span>Una fórmula exacta para que cada chat arranque con la energía correcta.</span>
                            </div>
                        </li>
                        <li>
                            <Check />
                            <div>
                                <strong>Guiones de venta por WhatsApp</strong>
                                <span>Plantillas listas para copiar, pegar y adaptar a tu negocio.</span>
                            </div>
                        </li>
                        <li>
                            <Check />
                            <div>
                                <strong>Catálogo que vende solo</strong>
                                <span>Cómo estructurar productos y precios para que el cliente pida comprar.</span>
                            </div>
                        </li>
                        <li>
                            <Check />
                            <div>
                                <strong>Manejo de objeciones</strong>
                                <span>Qué responder ante "está caro", "lo pienso" o "lo hablo con mi esposa".</span>
                            </div>
                        </li>
                        <li>
                            <Check />
                            <div>
                                <strong>Seguimientos que no acosan</strong>
                                <span>Secuencias de 3, 5 y 7 pasos para recuperar chats sin perseguir.</span>
                            </div>
                        </li>
                        <li>
                            <Check />
                            <div>
                                <strong>Automatizaciones básicas</strong>
                                <span>Respuestas rápidas, etiquetas y mensajes de ausencia que ahorran horas.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            {/* ================= TEMARIO ================= */}
            <section id="temario" className="lwa-section lwa-section--soft">
                <div className="lwa-container">
                    <div className="lwa-section__head--center" style={{ marginBottom: 42 }}>
                        <div className="lwa-eyebrow">Temario del taller</div>
                        <h2 className="lwa-title">6 módulos, 0 relleno</h2>
                        <p className="lwa-subtitle">
                            Todo lo que necesitas para pasar de "responder mensajes" a construir un
                            proceso de venta que funcione en piloto automático.
                        </p>
                    </div>

                    <div className="lwa-modules">
                        <article className="lwa-module">
                            <div className="lwa-module__num">MÓDULO 01</div>
                            <h3>Fundamentos de WhatsApp Business</h3>
                            <ul>
                                <li>Configuración profesional de tu cuenta</li>
                                <li>Perfil, horarios y mensaje de bienvenida</li>
                                <li>Diferencias con WhatsApp personal</li>
                            </ul>
                        </article>

                        <article className="lwa-module">
                            <div className="lwa-module__num">MÓDULO 02</div>
                            <h3>Psicología del cliente por chat</h3>
                            <ul>
                                <li>Cómo piensa y decide el prospecto digital</li>
                                <li>Tiempos de respuesta y primera impresión</li>
                                <li>El error #1 que mata tus ventas</li>
                            </ul>
                        </article>

                        <article className="lwa-module">
                            <div className="lwa-module__num">MÓDULO 03</div>
                            <h3>Proceso de venta en 7 pasos</h3>
                            <ul>
                                <li>Saludo → calificación → oferta → cierre</li>
                                <li>Scripts listos para copiar y pegar</li>
                                <li>Cómo llevar la conversación a la venta</li>
                            </ul>
                        </article>

                        <article className="lwa-module">
                            <div className="lwa-module__num">MÓDULO 04</div>
                            <h3>Objeciones y cierre</h3>
                            <ul>
                                <li>Respuestas a "está caro" y "lo pienso"</li>
                                <li>Técnicas de cierre aplicadas al chat</li>
                                <li>Cómo crear urgencia sin ser intenso</li>
                            </ul>
                        </article>

                        <article className="lwa-module">
                            <div className="lwa-module__num">MÓDULO 05</div>
                            <h3>Catálogo, embudos y automatización</h3>
                            <ul>
                                <li>Catálogo que vende sin que lo expliques</li>
                                <li>Etiquetas, listas y respuestas rápidas</li>
                                <li>Integración con Meta Ads y landing pages</li>
                            </ul>
                        </article>

                        <article className="lwa-module">
                            <div className="lwa-module__num">MÓDULO 06</div>
                            <h3>Métricas y seguimiento</h3>
                            <ul>
                                <li>KPIs reales que sí debes medir</li>
                                <li>Plantilla de seguimiento de chats</li>
                                <li>Cómo escalar sin quemarte</li>
                            </ul>
                        </article>
                    </div>
                </div>
            </section>

            {/* ================= INSTRUCTOR ================= */}
            <section className="lwa-section">
                <div className="lwa-container">
                    <div className="lwa-section__head--center" style={{ marginBottom: 36 }}>
                        <div className="lwa-eyebrow">Quién lo imparte</div>
                        <h2 className="lwa-title">Tu instructor: Lewis Pineda</h2>
                    </div>

                    <div className="lwa-instructor">
                        <div className="lwa-instructor__photo">LP</div>
                        <div>
                            <h3>Lewis Pineda</h3>
                            <p className="lwa-instructor__role">Especialista en ventas por WhatsApp Business y publicidad digital</p>
                            <p>
                                Lewis ayuda a marcas, negocios y profesionales a aumentar su productividad y
                                sus cierres a través de WhatsApp Business y herramientas complementarias. Ha
                                trabajado con equipos de ventas en LATAM y formó parte del equipo de Jürgen
                                Klaric, donde profundizó en neuroventas.
                            </p>
                            <p>
                                Su enfoque es 100% práctico: nada de teoría que no puedas aplicar el mismo día
                                en tu chat.
                            </p>
                            <div className="lwa-instructor__creds">
                                <span>+8 años vendiendo por WhatsApp</span>
                                <span>+500 alumnos formados</span>
                                <span>Meta Ads & Neuroventas</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= PRICE ================= */}
            <section id="precio" className="lwa-section lwa-section--soft">
                <div className="lwa-container">
                    <div className="lwa-section__head--center" style={{ marginBottom: 44 }}>
                        <div className="lwa-eyebrow">Inversión</div>
                        <h2 className="lwa-title">Un taller que se paga con tu próxima venta</h2>
                        <p className="lwa-subtitle">
                            Acceso inmediato, bonos incluidos y garantía de satisfacción. Sin letras chiquitas.
                        </p>
                    </div>

                    <div className="lwa-price">
                        <div className="lwa-price__tag">Oferta de lanzamiento</div>
                        <h3>Taller de Ventas por WhatsApp</h3>
                        <p className="tagline">Acceso completo + bonos + comunidad</p>

                        <div className="lwa-price__amount">
                            <span className="old">$197</span>
                            <span className="new">$47</span>
                            <span className="cur">USD</span>
                        </div>
                        <div className="installments">Pago único · Acceso de por vida</div>

                        <ul>
                            <li><Check size={18} /> 6 módulos en video (acceso 24/7)</li>
                            <li><Check size={18} /> Cuaderno de trabajo descargable</li>
                            <li><Check size={18} /> +30 plantillas de mensajes listas para usar</li>
                            <li><Check size={18} /> Guiones de objeciones y cierre</li>
                            <li><Check size={18} /> Bono #1: Plantillas de Meta Ads a WhatsApp</li>
                            <li><Check size={18} /> Bono #2: Auditoría grupal en vivo</li>
                            <li><Check size={18} /> Acceso a la comunidad privada</li>
                            <li><Check size={18} /> Certificado de participación</li>
                        </ul>

                        <a href={waCta} target="_blank" rel="noreferrer" className="lwa-btn lwa-btn--primary lwa-price__cta">
                            <WhatsappIcon size={20} />
                            Inscribirme al taller
                        </a>
                        <span className="lwa-price__note">Pagos seguros · Tarjeta, PayPal y transferencia</span>
                    </div>
                </div>
            </section>

            {/* ================= GUARANTEE ================= */}
            <section className="lwa-section">
                <div className="lwa-container">
                    <div className="lwa-guarantee">
                        <div className="lwa-guarantee__seal">
                            GARANTÍA<br />7 DÍAS<br />100%
                        </div>
                        <div>
                            <h3>Pruébalo sin riesgo por 7 días</h3>
                            <p>
                                Inscríbete hoy, revisa el taller completo y aplica lo aprendido durante una semana.
                                Si sientes que no es para ti, escríbeme y te devuelvo el 100% de tu inversión.
                                Sin preguntas, sin trámites, sin incomodidad. Así de seguro estoy de que funciona.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= TESTIMONIALS ================= */}
            <section className="lwa-section lwa-section--soft">
                <div className="lwa-container">
                    <div className="lwa-section__head--center" style={{ marginBottom: 40 }}>
                        <div className="lwa-eyebrow">Historias reales</div>
                        <h2 className="lwa-title">Lo que dicen los alumnos del taller</h2>
                    </div>

                    <div className="lwa-testis">
                        <div className="lwa-testi">
                            <div className="lwa-testi__stars">★★★★★</div>
                            <p>
                                "Pasé de cerrar 2 ventas por semana a 2 por día. Lo mejor es que ya no
                                improviso: sigo el guion y funciona. El dinero del taller lo recuperé en
                                48 horas."
                            </p>
                            <div className="lwa-testi__who">
                                <div className="lwa-avatar">MA</div>
                                <div>
                                    <strong>María A.</strong>
                                    <span>Boutique de ropa · CDMX</span>
                                </div>
                            </div>
                        </div>

                        <div className="lwa-testi">
                            <div className="lwa-testi__stars">★★★★★</div>
                            <p>
                                "Siempre invertía en Facebook Ads y perdía a los prospectos en el chat.
                                Con el sistema de Lewis ahora califico rápido y cierro sin presionar.
                                Tripliqué la conversión."
                            </p>
                            <div className="lwa-testi__who">
                                <div className="lwa-avatar">JR</div>
                                <div>
                                    <strong>Jorge R.</strong>
                                    <span>Servicios inmobiliarios · Guadalajara</span>
                                </div>
                            </div>
                        </div>

                        <div className="lwa-testi">
                            <div className="lwa-testi__stars">★★★★★</div>
                            <p>
                                "Lo que más me sirvió fueron las plantillas y cómo manejar objeciones.
                                Mi equipo ahora responde igual que yo y las ventas no dependen de que yo
                                esté conectada."
                            </p>
                            <div className="lwa-testi__who">
                                <div className="lwa-avatar">CS</div>
                                <div>
                                    <strong>Carla S.</strong>
                                    <span>Clínica estética · Bogotá</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FAQ ================= */}
            <section className="lwa-section">
                <div className="lwa-container">
                    <div className="lwa-section__head--center" style={{ marginBottom: 36 }}>
                        <div className="lwa-eyebrow">Preguntas frecuentes</div>
                        <h2 className="lwa-title">Todo lo que quieres saber antes de inscribirte</h2>
                    </div>

                    <div className="lwa-faq">
                        <details>
                            <summary>¿Para quién es este taller?</summary>
                            <p>
                                Para dueños de negocio, emprendedores, equipos de ventas, coaches y
                                profesionales que atienden clientes por WhatsApp y quieren un proceso claro
                                para cerrar más ventas. No necesitas conocimientos previos.
                            </p>
                        </details>
                        <details>
                            <summary>¿Cuándo inicia y cuánto dura?</summary>
                            <p>
                                El acceso es inmediato. Al inscribirte recibes todas las clases grabadas
                                para que avances a tu ritmo. Puedes completarlo en 1 fin de semana o
                                distribuirlo en 2 semanas.
                            </p>
                        </details>
                        <details>
                            <summary>¿Por cuánto tiempo tengo acceso?</summary>
                            <p>
                                El acceso es de por vida. Además, recibes gratis las actualizaciones futuras
                                del taller.
                            </p>
                        </details>
                        <details>
                            <summary>¿Necesito WhatsApp Business ya configurado?</summary>
                            <p>
                                No. En el Módulo 1 te enseño paso a paso cómo instalarlo y configurarlo de
                                forma profesional, incluso si nunca lo has usado.
                            </p>
                        </details>
                        <details>
                            <summary>¿Qué pasa si no me gusta?</summary>
                            <p>
                                Tienes 7 días de garantía total. Si sientes que no es para ti, te devuelvo
                                el 100% de tu inversión con solo escribirme por WhatsApp.
                            </p>
                        </details>
                        <details>
                            <summary>¿Qué medios de pago aceptan?</summary>
                            <p>
                                Tarjeta de crédito o débito, PayPal y transferencia bancaria. Puedes pagar
                                en tu moneda local.
                            </p>
                        </details>
                        <details>
                            <summary>¿Entregan factura?</summary>
                            <p>
                                Sí, si requieres factura escríbenos por WhatsApp después de tu inscripción
                                y te la enviamos con los datos fiscales que nos proporciones.
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* ================= FINAL CTA ================= */}
            <section className="lwa-final">
                <div className="lwa-container">
                    <h2>Deja de perder ventas en el chat. Empieza hoy.</h2>
                    <p>
                        Únete al Taller de Ventas por WhatsApp y lleva tu negocio al siguiente nivel —
                        con el sistema que ya usan cientos de alumnos en LATAM.
                    </p>
                    <a href={waCta} target="_blank" rel="noreferrer" className="lwa-btn lwa-btn--primary">
                        <WhatsappIcon size={20} />
                        Quiero mi acceso al taller
                    </a>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="lwa-footer">
                <div className="lwa-container lwa-footer__inner">
                    <div>© {new Date().getFullYear()} Lewis Pineda · Todos los derechos reservados</div>
                    <div>
                        <a href="#">Aviso de privacidad</a>
                        <a href="#">Términos</a>
                        <a href={waCta} target="_blank" rel="noreferrer">Contacto</a>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp button */}
            <a
                href={waCta}
                target="_blank"
                rel="noreferrer"
                className="lwa-float"
                aria-label="Contactar por WhatsApp"
            >
                <WhatsappIcon size={26} />
            </a>
        </div>
    );
}
