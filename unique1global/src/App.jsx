import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import { motion, AnimatePresence } from "framer-motion";

// --- FIX CRÍTICO: Configuración de Entorno Segura (Prevención de Pantalla Blanca) ---
// Accede a las variables de entorno de forma segura, usando valores por defecto.
const env = typeof import.meta.env !== "undefined" ? import.meta.env : {};
const VITE_API_URL = env.VITE_API_URL || "";
const VITE_WSS_URL = env.VITE_WSS_URL || "";
const VITE_PLATFORM_LOGO = env.VITE_PLATFORM_LOGO || "/unique1global-logo.png";
const VITE_PLATFORM_LOGO_WHITE =
  env.VITE_PLATFORM_LOGO_WHITE || "/unique1global-logo-white.png";
const VITE_PLATFORM_ID = env.VITE_PLATFORM_ID || "unique1global";

// --- Contenido de Políticas (Importado aquí para renderizar directamente) ---
const POLICY_MARKDOWN = `# Política sobre blanqueo de capitales  #

 

Política de AML/KYC 

 

Última actualización: 31 de julio de 2025 

Versión: 1.1 

 

1. Introducción 

1.1. Unique 1 Global es una plataforma digital integral de trading gestionada por Unique 1 Global Limited, una empresa registrada como Compañía de Negocios Internacionales (IBC) en Saint Lucia, bajo el número de empresa 3882-499234, con la oficina registrada ubicada 2134203 en Virgin Islands (British). La oficina registrada se encuentra en Clarence Thomas Building, P.O. Box 4649, Road Town, Tortola. (en adelante - “nosotros”,“nuestro”,“nos” o “Unique 1 Global”) 

1.2. Unique 1 Global opera tanto a través de un sitio web, disponible en https://uniqueoneglobal.com, como de una aplicación móvil (en adelante, “Plataforma“ o “Unique 1 Global”). Esta Plataforma permite a los usuarios participar en actividades de trading, incluyendo Contratos por Diferencia (CFDs, por sus siglas en inglés) sobre varios valores, instrumentos derivados, copy trading e inversión en carteras diversificadas, y proporcionar a los usuarios otros servicios (en adelante, los “Servicios”) que están completamente descritos en nuestros Términos y Condiciones. Como parte de nuestro compromiso de proporcionar un entorno robusto y seguro, Unique 1 Global ofrece herramientas y características que permiten a los usuarios tomar decisiones informadas en su trayectoria de trading. 

1.3. En Unique 1 Global, estamos comprometidos a mantener los más altos estándares de cumplimiento normativo, integridad y seguridad para nuestros usuarios y la Plataforma. Para respaldar estos compromisos, hemos implementado esta Política de AML/KYC (en adelante, la "Política"). Esta Política está diseñada para prevenir actividades ilegales como el lavado de dinero, la financiación del terrorismo y otras actividades financieras ilícitas en nuestra Plataforma. La Política es una parte integral de nuestras operaciones y proporciona directrices claras sobre cómo verificamos a los usuarios, monitoreamos las transacciones y cumplimos con las regulaciones locales e internacionales. Este documento tiene como objetivo informar a los usuarios sobre sus responsabilidades y nuestros procedimientos, asegurando que podamos contribuir todos a un entorno de comercio seguro y transparente. 

1.4. Esta Política puede ser actualizada periódicamente para reflejar cambios en las leyes aplicables, los requisitos regulatorios o las medidas internas de cumplimiento. Cuando se realicen cambios o actualizaciones significativas en la Política, notificaremos a los usuarios a través de los canales apropiados, incluyendo correo electrónico o notificaciones de la Plataforma. Le recomendamos que revise esta Política regularmente para mantenerse informado de cualquier cambio. Al continuar utilizando los Servicios de Unique 1 Global, usted reconoce y acepta cumplir con la Política actualizada. Es su responsabilidad entender los términos descritos en esta Política, así como las políticas adicionales que rigen el uso de la Plataforma. 

1.5. Esta Política de AML/KYC debe entenderse en conjunto con otros documentos y políticas disponibles en la Plataforma. 

1.6. Como parte de nuestros esfuerzos para prevenir el uso indebido de nuestra Plataforma, es esencial que los usuarios comprendan y sigan las directrices establecidas en esta Política. El incumplimiento de los requisitos KYC o la falta de información precisa durante el proceso de verificación puede resultar en retrasos, restricciones o incluso la suspensión del acceso a la cuenta. Invitamos a todos los usuarios a leer detenidamente esta Política y asegurarse de cumplir con los estándares requeridos para la verificación de identidad, la transparencia financiera y el cumplimiento. 

 

2. Propósito de los procesos AML/KYC implementados por Unique 1 Global 

2.1. El propósito de incorporar procesos AML y KYC en Unique 1 Global es asegurar un nivel razonable de cumplimiento con las leyes aplicables y las regulaciones internacionales. El objetivo principal es prevenir el lavado de dinero, la financiación del terrorismo y otras actividades ilícitas. Unique 1 Global está completamente comprometido a lograr un cumplimiento integral con las leyes y regulaciones internacionales relevantes relacionadas con la prevención del lavado de dinero y la financiación del terrorismo. En cumplimiento de este compromiso, Unique 1 Global ha adoptado y aplica disposiciones específicas establecidas en las normas y regulaciones de prevención del lavado de dinero y de la financiación del terrorismo, centradas principalmente en prevenir y detectar casos de lavado de dinero, financiación del terrorismo y otras actividades ilícitas. 

2.2. Además de cumplir con los requisitos legales, Unique 1 Global ha establecido políticas internas, directrices y recursos adicionales para crear un marco exhaustivo para realizar la debida diligencia en los usuarios, monitorear las transacciones y reportar cualquier actividad sospechosa. La implementación robusta de medidas KYC y AML tiene como objetivo proteger la Plataforma, a los usuarios y mantener la integridad general del sistema financiero. 

2.3. Específicamente, Unique 1 Global se dedica a reconocer y reportar de manera oportuna las acciones relacionadas con la conversión o transferencia de fondos provenientes de actividades delictivas, intentos de ocultar el origen ilícito de los fondos, o ayudar a individuos involucrados en actividades criminales a evadir las consecuencias legales. Cualquier participación en ocultar la verdadera naturaleza, origen, ubicación, disposición, movimiento, derechos o propiedad de fondos derivados de actividades delictivas, o recibir conscientemente fondos de actividades delictivas, genera preocupaciones para Unique 1 Global. En tales casos, Unique 1 Global cuestiona diligentemente dicho comportamiento y reporta de inmediato las sospechas de lavado de dinero a las autoridades pertinentes. La información y la documentación recopiladas durante estos procesos ayudan a las autoridades a analizar e investigar casos sospechosos de lavado de dinero. 

2.4. El marco regulatorio que rige la lucha contra el lavado de dinero y la financiación del terrorismo, aplicable a Unique 1 Global, sigue un enfoque basado en riesgos. Esto nos obliga a implementar medidas, políticas, controles y procedimientos proporcionales a los riesgos que enfrenta, con el objetivo de prevenir y mitigar esos riesgos. 

Reconociendo que cada cliente presenta niveles de riesgo variables, Unique 1 Global realiza una evaluación de riesgo específica para cada cliente al establecer una relación comercial o llevar a cabo transacciones ocasionales. Esta evaluación nos permite identificar riesgos potenciales, particularmente en casos donde se sospecha de lavado de dinero o financiamiento del terrorismo, o cuando surgen dudas sobre la precisión o adecuación de los datos de identificación del usuario obtenidos previamente. La evaluación nos permite desarrollar un perfil de riesgo para cada usuario, categorizando el nivel de riesgo como bajo, medio o alto. 

 

3. Poner en práctica los pasos de "Conoce a tu Cliente" 

3.1. Para garantizar que Unique 1 Global opere de manera segura y cumpla con las normativas, seguimos un conjunto de procedimientos esenciales para comprender a nuestros usuarios y prevenir actividades sospechosas. Nuestro proceso de Diligencia Debida del Cliente (en adelante, "CDD", por sus siglas en inglés) nos ayuda a evaluar y verificar a los usuarios, asegurando que cumplimos con las regulaciones de AML y KYC. 

3.2. El proceso de CDD se implementa para evaluar el riesgo asociado con cada usuario. Incluye los siguientes pasos: 

Recopilamos la información personal y los documentos necesarios para verificar la identidad del usuario. 
Evaluamos el historial financiero del usuario, su historial de trading y su ubicación geográfica para determinar el nivel de riesgo. Los clientes en jurisdicciones de mayor riesgo o con antecedentes financieros complejos pueden estar sujetos a controles mejorados. 
Después de la creación de la cuenta Unique 1 Global, monitoreamos continuamente las transacciones y actividades en busca de cualquier patrón inusual que pueda indicar comportamiento sospechoso, como el lavado de dinero o la financiación del terrorismo. Si es necesario, realizamos verificaciones adicionales e informamos cualquier actividad sospechosa a las autoridades pertinentes. 
 

4. Procedimientos de verificación de usuarios 

4.1. Como parte del compromiso de Unique 1 Global con las regulaciones AML/KYC, nuestra Plataforma requiere un proceso integral de identificación de usuarios para todos los registros de cuentas. Esto es esencial para garantizar la integridad de la Plataforma, mantener un entorno de trading seguro y proteger a nuestros usuarios de actividades ilegales como el fraude, el lavado de dinero y la financiación del terrorismo. 

4.2. Para los usuarios regulares (aquellos no sujetos a la Diligencia Debida Mejorada (en adelante, "EDD", por sus siglas en inglés), el proceso de verificación es un paso esencial para acceder a todas las funciones de la Plataforma. Este proceso garantiza el cumplimiento de las regulaciones KYC y AML. 

Los usuarios deben proporcionar datos personales básicos durante el proceso de registro. Esto incluye: nombre completo, fecha de nacimiento, país de residencia, dirección de correo electrónico y número de teléfono. Estos detalles ayudan a verificar su identidad y a establecer su perfil de usuario en la plataforma. 

Para completar el proceso de verificación de identidad, los usuarios deben subir los siguientes documentos: documento de identificación emitido por el gobierno (los documentos comunes incluyen un pasaporte, una tarjeta de identificación nacional o una licencia de conducir), comprobante de domicilio (se utilizarán documentos como una factura de servicios públicos, un estado de cuenta bancario o un documento fiscal para confirmar su residencia). También se requiere la verificación de vida. 

Toda la información y los documentos proporcionados durante el proceso de verificación están cifrados y almacenados de manera segura para mantener la confidencialidad de sus datos personales. Tomamos muy en serio la protección de su información sensible y cumplimos con los estándares de la industria para salvaguardar su privacidad. 

Una vez que su identidad sea verificada con éxito, obtendrá acceso completo a las funciones de la plataforma, incluyendo la capacidad de retirar fondos (siempre que cumpla con el nivel de cuenta necesario para los retiros). 

Es importante tener en cuenta que los retiros solo están disponibles para los usuarios que han completado el proceso de verificación completo en el Nivel 1 o Nivel 2 (consulte nuestros Términos y Condiciones). 

4.3. En casos específicos, Unique 1 Global puede aplicar EDD para usuarios que presenten mayores riesgos. Esto generalmente se aplica a: 

Personas Políticamente Expuestas (en adelante, "PEPs", por sus siglas en inglés): individuos que ocupan o han ocupado cargos públicos prominentes, o sus familiares. 
Transacciones de alto valor: transacciones grandes que podrían generar preocupaciones sobre el origen de los fondos. 
Jurisdicciones de alto riesgo: usuarios ubicados en o que tratan con países que están sujetos a un mayor escrutinio regulatorio. 
Usuarios cuyos ingresos principales provienen de sectores informales (por ejemplo, negocios no registrados). 
Usuarios involucrados en transacciones de criptomonedas: usuarios que utilizan intercambios no regulados o plataformas peer-to-peer. Las transacciones de criptomonedas son monitoreadas de cerca debido a su potencial de mayor anonimato y volatilidad. 
En tales casos, el proceso de verificación será más exhaustivo y puede incluir pasos adicionales, como solicitudes de documentación sobre el origen de los fondos, revisión de la actividad económica, monitoreo continuo de la actividad de la cuenta del usuario por parte de nuestro equipo de cumplimiento. 

 

5. Ubicaciones restringidas 

5.1. Para cumplir con los requisitos legales y las directrices internas, nos abstendremos de proporcionar Servicios o participar en actividades comerciales con individuos de países incluidos en diversas sanciones, incluidas las listas negras y grises del GAFI. Además, nos reservamos el derecho de excluir jurisdicciones a nuestra discreción, con la posibilidad de actualizaciones ocasionales. 

5.2. Específicamente, nuestra Plataforma no ofrece servicios a clientes en las siguientes ubicaciones: Afganistán, Albania, Argelia, Angola, Baréin, Bangladés, Barbados, Bielorrusia, Benín, Bután, Bosnia y Herzegovina, Botsuana, Burkina Faso, Burundi, Camboya, Camerún, Cabo Verde, República Centroafricana, Chad, China, Comoras, República Democrática del Congo, región de Crimea, Cuba, Yibuti, Egipto, Eritrea, Etiopía, Fiyi, Gabón, Ghana, Guinea, Haití, Irán, Irak, Jamaica, Jordania, Kenia, Kosovo, Kuwait, Laos, Líbano, Liberia, Libia, Macedonia del Norte, Madagascar, Malaui, Maldivas, Malí, Marruecos, Birmania, Namibia, Nepal, Níger, Nigeria, Corea del Norte, Chipre del Norte, Omán, Pakistán, Palaos, Catar, Rusia, Ruanda, Somalia, Senegal, Sudán del Sur, Sudán y Darfur, Siria, Tanzania, Togo, Trinidad y Tobago, Túnez, Tuvalu, EE.UU., Vanuatu, Ciudad del Vaticano, Yemen, Zambia, Zimbabue. 

 

6. Actividades comerciales restringidas 

6.1. Unique 1 Global prohíbe a los usuarios participar en cualquier actividad comercial que implique actividades ilegales o ilícitas. Lo siguiente está estrictamente prohibido en la Plataforma: 

cualquier actividad diseñada para ocultar o disfrazar el origen de fondos obtenidos ilegalmente, incluyendo la transferencia de fondos a través de la Plataforma con la intención de limpiar o lavar dinero; 
participar en actividades financieras destinadas a financiar el terrorismo o apoyar a organizaciones terroristas; 
usar los Servicios de Unique 1 Global para llevar a cabo actividades fraudulentas, incluyendo pero no limitado a robo de identidad, tergiversación o estafas financieras; 
promover o participar en esquemas Ponzi, esquemas piramidales, o cualquier otra forma de esquemas de inversión fraudulentos que engañen a los inversores o violen las regulaciones financieras; 
usar la Plataforma para comerciar con bienes o servicios ilegales, incluyendo pero no limitado a productos falsificados, drogas, armas, o cualquier otro bien prohibido bajo las leyes aplicables. 
6.2. Ciertas actividades o tipos de negocios de alto riesgo están sujetos a un escrutinio adicional y pueden ser restringidos o prohibidos según consideraciones. Estas actividades incluyen: 

usuarios involucrados en la operación de intercambios de criptomonedas no regulados o plataformas de igual a igual que carecen de transparencia o cumplimiento con las regulaciones financieras; 
negocios involucrados en actividades financieras como préstamos, crowdfunding o esquemas de inversión sin las licencias adecuadas o la aprobación regulatoria correspondiente; 
plataformas que ofrecen juegos de azar, apuestas o loterías que no están licenciadas o reguladas en la jurisdicción en la que operan; 
negocios que facilitan transferencias de dinero o remesas que no cumplen con las regulaciones de AML o KYC o están ubicados en jurisdicciones de alto riesgo. 
6.3. Unique 1 Global puede restringir a los usuarios o negocios que operen o se relacionen con países identificados como de alto riesgo para delitos financieros o violaciones de AML/CFT. Tales jurisdicciones de alto riesgo pueden incluir, pero no se limitan a: 

países bajo sanciones económicas por parte de organismos internacionales como las Naciones Unidas o los Estados Unidos; 
jurisdicciones con marcos regulatorios débiles para los servicios financieros, o aquellas que carecen de regulaciones AML/CFT. 
Para los usuarios o negocios involucrados en estas regiones, Unique 1 Global se reserva el derecho de imponer controles adicionales de debida diligencia o restringir el acceso a la Plataforma. 

6.4. Los usuarios son los únicos responsables de garantizar que sus actividades cumplan con las políticas de Unique 1 Global y las regulaciones locales e internacionales aplicables. Al utilizar la Plataforma, usted acepta no participar en ninguna de las actividades comerciales prohibidas o restringidas enumeradas anteriormente. El incumplimiento de estas restricciones resultará en la suspensión de la cuenta, la reversión de transacciones y posibles acciones legales dependiendo de la gravedad de la violación. Unique 1 Global se reserva el derecho de informar cualquier actividad ilegal o sospechosa a las autoridades pertinentes. 

 

7. Evaluación de riesgos 

7.1. En Unique 1 Global, adoptamos un enfoque integral para evaluar los riesgos asociados con nuestros usuarios, productos, servicios y transacciones. Este proceso nos ayuda a identificar y mitigar los riesgos potenciales relacionados con el lavado de dinero y la financiación del terrorismo. La evaluación del riesgo se basa en varios factores clave, que incluyen el riesgo del usuario, el riesgo del producto/servicio/transacción, el riesgo de la interfaz y el riesgo geográfico. 

7.2. El nivel de riesgo asociado con un usuario se evalúa considerando múltiples factores, centrándose principalmente en la actividad económica del usuario y la fuente de su riqueza. El objetivo principal es determinar si el usuario presenta algún riesgo mayor de participar en el lavado de dinero o la financiación del terrorismo. 

Un usuario con una única fuente de ingresos estable (por ejemplo, empleo asalariado o actividad empresarial estable) generalmente presenta un menor riesgo de AML/CFT. En contraste, los usuarios con múltiples fuentes de ingresos o ganancias irregulares pueden presentar un mayor riesgo debido a la complejidad y la posible opacidad de sus actividades financieras. 

Entender cómo un usuario genera riqueza es crucial. Los usuarios con fuentes de riqueza claras y transparentes (como el empleo regular o un negocio legítimo) representan un menor riesgo. Sin embargo, los usuarios con fuentes de riqueza vagas o inexplicadas, o aquellos que se dedican a sectores empresariales de alto riesgo, pueden ser señalados para un examen más detallado. 

7.3. Ciertos productos, servicios o transacciones inherentemente conllevan mayores riesgos debido a su susceptibilidad a la explotación criminal. Estos riesgos pueden surgir de la naturaleza de la transacción, los métodos de pago o el producto o servicio que se está intercambiando. 

Los productos financieros como las herramientas de trading apalancadas, las criptomonedas y los activos altamente líquidos son a menudo favorecidos por los criminales debido a su volatilidad, facilidad de movimiento y potencial para grandes transacciones. 

Las transacciones que involucran métodos de pago no regulados (por ejemplo, plataformas de igual a igual [peer-to-peer] o criptomonedas sin una supervisión regulatoria clara) son más vulnerables a la explotación. Estas transacciones pueden estar sujetas a un monitoreo más cercano y a una mayor diligencia debida para prevenir su uso indebido. 

Todas las transacciones, particularmente aquellas que involucren productos o servicios de alto riesgo, serán sometidas a un escrutinio más riguroso para asegurar que cumplan con las regulaciones de AML y CTF. 

7.4. Los canales utilizados para establecer una relación comercial y realizar transacciones juegan un papel importante en la evaluación del perfil de riesgo de la relación o transacción. Unique 1 Global asegura que todos los registros de usuarios y transacciones se procesen a través de canales seguros para mitigar los riesgos relacionados con la interfaz a través de la cual se accede a los servicios. 

7.5. El riesgo geográfico se refiere a los riesgos potenciales asociados con la nacionalidad, residencia o la ubicación de las actividades económicas de un usuario. La evaluación del riesgo tiene en cuenta el entorno regulatorio del país en el que opera el usuario, así como la fuente de los fondos. 

Los países con sistemas débiles de AML/CFT, altos niveles de corrupción o aquellos sujetos a sanciones internacionales (como sanciones relacionadas con el terrorismo o la proliferación de armas) se consideran de alto riesgo. Además, los países conocidos por albergar organizaciones terroristas o participar en actividades financieras ilícitas presentan mayores riesgos geográficos. 

Los países con marcos sólidos de AML/CFT y bajos niveles de lavado de dinero y financiamiento del terrorismo se consideran de riesgo medio o bajo. Los países con regulaciones bien establecidas y cooperación internacional en delitos financieros presentan menores riesgos. 

Unique 1 global aplica controles adicionales de debida diligencia para usuarios de jurisdicciones de alto riesgo, que pueden incluir la verificación del origen de los fondos, el monitoreo de los patrones de transacción y la realización de evaluaciones continuas de las actividades del usuario. 

 

8. Monitoreo de transacciones 

8.1. Nuestra plataforma emplea herramientas avanzadas de monitoreo de transacciones para identificar y analizar actividades potencialmente sospechosas. Estas herramientas examinan continuamente las transacciones, el comportamiento de las cuentas y los patrones indicativos de lavado de dinero o financiamiento del terrorismo. 

 

9. Mantenimiento de registros 

9.1. Nuestra Plataforma mantiene registros detallados, incluyendo información de identificación del cliente, datos de transacciones y comunicaciones, por un mínimo de 5 años, a menos que se requiera una retención más prolongada por ley, regulación o directiva aplicable. Estos registros se almacenan de manera segura y son fácilmente accesibles para auditorías y requisitos regulatorios. 

 

10. Capacitación del personal 

10.1. Se proporciona capacitación regular y exhaustiva sobre las políticas y procedimientos de AML y KYC a todos los empleados y personal relevante dentro del Unique 1 Global. Esta capacitación asegura que estén completamente al tanto de sus responsabilidades y preparados para identificar y reportar eficazmente cualquier actividad sospechosa. 

 

11. Nombramiento del oficial de cumplimiento 

11.1. Un oficial de cumplimiento designado es nombrado por la plataforma para supervisar la implementación y el cumplimiento de las políticas de AML y KYC. Este oficial de cumplimiento asegura que Unique 1 Global se mantenga actualizado con los requisitos regulatorios y reporta de inmediato cualquier inquietud o sospecha a las autoridades correspondientes. 

 

12. Auditorías externas y cooperación con terceros 

12.1. Unique 1 Global se somete regularmente a auditorías autónomas de su programa de AML/CFT para medir su eficacia, identificar áreas de mejora y asegurar el cumplimiento de las regulaciones. Los hallazgos de estas auditorías son revisados minuciosamente por la dirección, y se toman las medidas adecuadas para corregir cualquier deficiencia identificada. 

12.2. Para garantizar la seguridad, precisión y cumplimiento de nuestra Plataforma, Unique 1 Global utiliza proveedores de servicios de terceros para ayudar en la verificación de nuestros usuarios. Estos proveedores nos ayudan a realizar verificaciones críticas de identidad y controles de cumplimiento de AML/KYC para mitigar riesgos y prevenir delitos financieros como el lavado de dinero y la financiación del terrorismo. Confiamos en herramientas de verificación de terceros de confianza para verificar la identidad de los usuarios, confirmar la legitimidad de las transacciones financieras y asegurar que todos los usuarios cumplan con los requisitos regulatorios necesarios. Estas herramientas pueden incluir acceso a bases de datos gubernamentales, agencias de calificación crediticia y servicios de verificación biométrica cuando sea aplicable. Unique 1 Global asegura que todos los proveedores externos utilizados en el proceso de verificación cumplan con las leyes de protección de datos y manejen su información personal con la máxima confidencialidad y seguridad. 

 

13. Colaboración con las autoridades 

13.1. Mantenemos plena cooperación con las autoridades pertinentes, como las agencias de aplicación de la ley y los organismos reguladores, durante las investigaciones o indagaciones relacionadas con el lavado de dinero, la financiación del terrorismo u otras actividades ilícitas. La organización proporciona de manera oportuna la información y asistencia solicitadas dentro de los límites de las leyes y regulaciones aplicables. Unique 1 Global se esfuerza por cumplir con las obligaciones de informes específicas de cada país, incluyendo la presentación de Informes de Actividad Sospechosa ante las unidades locales de inteligencia financiera. 

 

14. Relaciones con terceros 

14.1. Al establecer relaciones comerciales con terceros, exigimos la adherencia a los mismos procesos de AML y KYC descritos en esta Política y guiados por el equipo de cumplimiento de Unique 1 Global. La supervisión continua y las revisiones periódicas son realizadas por Unique 1 Global para evaluar el cumplimiento de estas terceras partes con las regulaciones de AML y KYC. 

 

15. Cambios a esta Política 

15.1. Este aviso de Política se somete a evaluaciones regulares para asegurar su efectividad y cumplimiento con las regulaciones y mejores prácticas en evolución. Las actualizaciones y enmiendas se implementan según sea necesario. La fecha de entrada en vigor significa el inicio de la última versión de esta Política. Cualquier cambio en la fecha de entrada en vigor se indicará claramente al principio de esta Política. 

15.2. Invitamos a todos los usuarios a revisar regularmente esta política para mantenerse informados sobre cualquier actualización. Unique 1 Global notificará a los usuarios sobre cambios significativos a través de correo electrónico o notificaciones en la Plataforma. Al continuar utilizando los Servicios de Unique 1 Global después de cualquier modificación de esta Política, usted reconoce y acepta los términos y condiciones actualizados. 

 

16. Información de contacto 

Si tiene alguna pregunta, necesita asistencia o requiere aclaraciones sobre nuestra Política AML/KYC, estamos aquí para ayudarle. Ya sea que necesite apoyo con el proceso de verificación de identidad, tenga preocupaciones sobre su estado de cumplimiento o necesite una explicación adicional sobre nuestros procedimientos, no dude en ponerse en contacto con nosotros: 

Teléfono: +371 254 93 902 
Email: support@uniqueoneglobal.com 
Dirección operativa: 2134203 en Virgin Islands (British). La oficina registrada se encuentra en Clarence Thomas Building, P.O. Box 4649, Road Town, Tortola 
Estamos comprometidos a ofrecer un soporte eficiente y confiable para asegurarnos de que comprenda completamente sus responsabilidades bajo nuestra Política AML/KYC. Nuestro equipo está disponible para guiarle a través de cualquier proceso de verificación, abordar cualquier inquietud respecto al estado de cumplimiento de su cuenta, o proporcionar información sobre nuestros procedimientos de AML/KYC. 

 

________________________________________________________________________________________________________________________________________________________________ 

 

Política sobre Cookies  

 

Política de cookies 

Última actualización: 30 de julio de 2025 

Versión: 1.1 

 

1. Introducción 

1.1. Unique 1 Global es una plataforma digital de comercio integral gestionada por Unique One Global Ltd, una empresa registrada como International Business Company (IBC) en Saint Lucia, bajo el número de empresa 3882-499234, con la oficina registrada ubicada en 2134203 en Virgin Islands (British). La oficina registrada se encuentra en Clarence Thomas Building, P.O. Box 4649, Road Town, Tortola 

1.2. Unique 1 Global opera tanto a través de un sitio web, disponible en https://uniqueoneglobal.com, ccomo de una aplicación móvil (en adelante - “Plataforma“ o “Unique 1 Global”). Esta Plataforma permite a los usuarios participar en actividades de trading, incluyendo Contratos por Diferencia (CFDs, por sus siglas en inglés) sobre varios valores, instrumentos derivados, copy trading e inversión en carteras diversificadas (en adelante, los “Servicios”), una lista completa y descripciones detalladas de nuestros Servicios están disponibles en los Términos y Condiciones, los cuales le recomendamos que revise. Como parte de nuestro compromiso de proporcionar un entorno robusto y seguro, Unique 1 Global ofrece herramientas y características que permiten a los usuarios tomar decisiones informadas en su trayectoria de trading. 

1.3. La Plataforma ha sido diseñada para operar en estricta conformidad con todos los marcos legales y regulatorios aplicables, asegurando que todas las interacciones se manejen de acuerdo con las leyes locales e internacionales aplicables. 

1.4. En Unique 1 Global, estamos comprometidos a proporcionar una experiencia segura, eficiente y personalizada para nuestros usuarios. Para lograr esto, utilizamos cookies y tecnologías de seguimiento similares en nuestra Plataforma. Esta Política de Cookies explica qué son las cookies, cómo las usamos y cómo puedes gestionarlas o controlarlas mientras interactúas con nuestra Plataforma y Servicios (en adelante, la “Política”). 

1.5. Al utilizar nuestro sitio web o aplicación móvil, usted consiente el uso de cookies según lo descrito en esta Política. Sin embargo, siempre puedes ajustar tus preferencias o retirar su consentimiento en cualquier momento. 

1.6. Podemos actualizar periódicamente esta Política para reflejar cambios en nuestro uso de cookies, tecnologías relevantes o requisitos legales. La versión más reciente de esta Política, disponible en nuestra Plataforma, regirá el uso de cookies y otras tecnologías de seguimiento. Le recomendamos que revise esta Política regularmente para mantenerse informado sobre cómo usamos las cookies y cómo puede gestionarlas. En caso de que haya cambios o adiciones materiales a esta Política, le notificaremos por correo electrónico o mediante un aviso destacado en nuestra Plataforma. Al continuar utilizando nuestra Plataforma después de cualquier actualización o cambio en esta Política, usted reconoce que ha revisado la política actualizada y consiente nuestro uso de cookies según lo descrito. 

1.7. Es crucial que revise esta Política junto con cualquier otra política y documentos que se publiquen y estén disponibles para su revisión en la Plataforma. 

1.8. Para obtener una visión completa de cómo recopilamos, usamos, almacenamos y protegemos sus datos personales, consulte nuestra Política de Privacidad. La Política de Privacidad proporciona información detallada sobre sus derechos con respecto a sus datos personales, incluyendo acceso, corrección, eliminación y otros derechos. También describe las medidas de seguridad que implementamos para proteger sus datos y cómo manejamos su información en cumplimiento con las leyes de protección de datos aplicables. Le recomendamos que revise la Política de Privacidad para comprender nuestras prácticas completas de protección de datos. 

 

2. ¿Qué son las cookies y tecnologías similares? 

2.1. Las cookies son pequeños archivos de texto que se colocan en su dispositivo cuando visita un sitio web o utiliza una aplicación. Estos archivos ayudan a los sitios web y aplicaciones a recordar sus preferencias, acciones y actividades de navegación a lo largo del tiempo. Las cookies permiten una experiencia más personalizada, eficiente y segura al almacenar información sobre su interacción con la Plataforma. 

2.2. Además de las cookies, se utilizan tecnologías similares como señales web, píxeles y almacenamiento local para propósitos similares. Estas tecnologías nos permiten recopilar y almacenar información sobre su uso de nuestra Plataforma y Servicios, lo que nos ayuda a mejorar la Plataforma y mejorar su experiencia. 

2.3. Para obtener más información sobre las cookies en general, puede visitar www.aboutcookies.org ó www.allaboutcookies.org 

 

3. Tipos de cookies y qué categorías de cookies utilizamos 

3.1. Cada tipo de cookie cumple una función específica, contribuyendo al rendimiento general y la experiencia de uso de Unique 1 Global. A continuación, describimos los diferentes tipos de cookies que utilizamos: 

3.1.1 Por duración - 

Las cookies de sesión son temporales y solo existen durante una única sesión de navegación. Se eliminan cuando cierra su navegador o abandona la Plataforma. Las cookies de sesión nos ayudan a vincular sus acciones dentro de una sesión específica y a asegurarnos de que pueda navegar por el sitio sin perder el progreso o las preferencias. 
Las cookies persistentes permanecen en su dispositivo entre sesiones de navegación. Almacenan sus preferencias, acciones e información de inicio de sesión para recordar sus configuraciones la próxima vez que visite el sitio. Las cookies persistentes caducan después de un período establecido o pueden ser eliminadas manualmente por usted a través de la configuración de su navegador. 
3.1.2. Por dominio - 

Las cookies de primera parte son establecidas por el dominio del sitio web que está visitando actualmente (en este caso, nuestra Plataforma). Las cookies de primera parte nos permiten personalizar su experiencia y rastrear sus preferencias dentro de nuestra Plataforma. 
Las cookies de terceros son establecidas por un dominio diferente al del sitio web que está visitando. Las cookies de terceros son a menudo utilizadas por proveedores de servicios externos, como anunciantes o proveedores de análisis, para rastrear el comportamiento del usuario a través de múltiples sitios con el propósito de entregar anuncios relevantes o medir el rendimiento del sitio web. 
3.1.3. Por propósito - 

Las cookies estrictamente necesarias son esenciales para el funcionamiento básico de la Plataforma. Le permiten navegar por nuestra Plataforma y utilizar sus funciones, como el inicio de sesión seguro, el procesamiento de transacciones y las medidas de prevención de fraudes. Sin estas cookies, ciertas funciones esenciales pueden no estar disponibles. 
Las cookies funcionales mejoran la funcionalidad de nuestra Plataforma al recordar sus preferencias y elecciones, como la configuración del idioma, el tamaño de la fuente u otras personalizaciones que haya realizado. También nos permiten ofrecerle una experiencia más personalizada y fluida. 
Las cookies de rendimiento y análisis recopilan información sobre cómo los usuarios interactúan con la Plataforma, como cuáles son las páginas más visitadas y si los usuarios encuentran algún error. Utilizamos estos datos para mejorar la funcionalidad, la velocidad y el rendimiento general de nuestros Servicios, así como para mejorar la experiencia del usuario. 
Las cookies de publicidad y segmentación rastrean su actividad en línea para ofrecer anuncios personalizados basados en sus intereses e historial de navegación. Pueden ser establecidos por redes publicitarias de terceros y se utilizan para limitar la cantidad de veces que ve un anuncio y para medir la efectividad de las campañas publicitarias. 
3.2. Más información detallada sobre los tipos y propósitos de las cookies que utilizamos se proporciona en la tabla a continuación: 



Nombre de la cookie	Descripción	Propósito

__hssrc	Revalidación de sesión de HubSpot	Determina si el visitante reinició su navegador

__hstc	Cookie de seguimiento de HubSpot	Rastrea a los visitantes a lo largo de las visitas y sesiones

_fbp	Cookie de Facebook Pixel	Entrega publicidad cuando está en Facebook o en una plataforma digital impulsada por la publicidad de Facebook

_ga	Cookie de Google Analytics	Usada para distinguir usuarios

_ga_P3ZLRG07HF	Cookie específica de propiedad de Google Analytics	Se utiliza para mantener el estado de la sesión

_gcl_au	Cookie de Google AdSense	Almacena y rastrea conversiones

_hjSession_5315535	Cookie de sesión de Hotjar	Asegura que las solicitudes posteriores en la ventana de la sesión se atribuyan a la misma sesión

_hjSessionUser_5315535	Cookie persistente de Hotjar	Conserva el ID de usuario de Hotjar, único para ese sitio

_tt_enable_cookie	Cookie de seguimiento de TikTok	Usado para rastrear el comportamiento del usuario para los servicios de marketing de TikTok

_ttp	Cookie de TikTok	Mide y mejora el rendimiento de las campañas publicitarias de TikTok

ajs_anonymous_id	Segmentación anónima de seguimiento de usuarios	Rastrea el comportamiento del usuario de forma anónima

analytics_session_id	ID de sesión de análisis	Utilizado para identificar una instancia de sesión específica con fines de análisis

analytics_session_id.last_access	Último acceso a la sesión de análisis	Registra la marca de tiempo de la última actividad

hubspotutk	Cookie de seguimiento de HubSpot	Rastrea a los visitantes para los envíos de formularios

lang	Cookie de preferencia de idioma	Almacena las preferencias de idioma del usuario

langApp	Preferencia de idioma de la aplicación	Almacena el idioma seleccionado por el usuario en la aplicación

messagesUtk	Cookie de seguimiento de mensajes de HubSpot	Recuerda la identidad del visitante que usa el widget de chat

ph_phc_dAzKNHi5VPvDD6u12C5yYz4jG0Pr3pj5Ecb23ol4tFa_posthog	Cookie de PostHog	Rastrea el análisis de uso de la aplicación

referrer	URL de referencia	Almacena la URL de la página de referencia

ttcsid	ID de sesión de TikTok	Usado para identificar la sesión para el seguimiento de TikTok

ttcsid_CQBQU4BC77UJJEOTEDI0	Identificador de sesión de TikTok	Usado por TikTok para rastrear la sesión para el análisis de rendimiento y la optimización de la entrega de anuncios

utm_landingpage_url	Cookie de seguimiento UTM	Almacena la URL de la primera página de destino visitada, utilizada para la atribución de campañas de marketing

Tenga en cuenta que la lista de cookies proporcionada en la tabla anterior está sujeta a actualizaciones periódicas. Dado que podemos agregar, eliminar o modificar las cookies utilizadas en nuestra plataforma según los cambios en nuestros Servicios, tecnologías o necesidades comerciales, la tabla puede reflejar actualizaciones con el tiempo. Recomendamos revisar la tabla regularmente para mantenerse informado sobre los tipos de cookies que utilizamos, sus propósitos y sus respectivas duraciones. Se le notificará de cualquier cambio significativo en nuestras prácticas de cookies a través de los métodos descritos en esta Política. 

3.3. Nuestra herramienta de consentimiento de cookies proporciona información detallada sobre las cookies que utilizamos en nuestra Plataforma, incluyendo su propósito y fecha de caducidad. A través de esta herramienta, puede gestionar sus preferencias y decidir qué tipos de cookies le gustaría aceptar o rechazar. Esto garantiza que tenga el control total sobre sus preferencias de cookies mientras utiliza nuestros Servicios. 

 

4. Por qué usamos cookies 

4.1. En Unique 1 Global, utilizamos cookies para mejorar su experiencia en nuestra Plataforma y para asegurar el correcto funcionamiento de nuestros Servicios. Las cookies desempeñan un papel esencial en hacer que nuestro sitio web sea más fácil de usar, eficiente y seguro. A continuación se presentan las principales razones por las que utilizamos cookies: 

Las cookies nos ayudan a ofrecer una experiencia más personalizada y fluida para los usuarios. Al recordar sus preferencias (como la configuración de idioma, región o preferencias de visualización), las cookies nos permiten ofrecer contenido que se adapte a tus necesidades sin que tenga que volver a ingresar información cada vez que nos visite. Esto resulta en una experiencia de navegación más eficiente y agradable. 
Las cookies nos permiten recopilar datos sobre cómo los usuarios interactúan con nuestra Plataforma. Estos datos nos permiten identificar cuáles son las características más populares, cuánto tiempo pasan los usuarios en páginas específicas y dónde se pueden hacer mejoras. Usamos esta información para optimizar el rendimiento y la funcionalidad de nuestro sitio web, asegurando que funcione sin problemas y satisfaga las necesidades de todos los usuarios. 
Ciertas cookies son esenciales para mantener la seguridad de su cuenta y protegerle de accesos no autorizados. Estas cookies se utilizan para verificar su identidad durante el inicio de sesión, rastrear actividades sospechosas y asegurar que su cuenta permanezca segura. Sin estas cookies, las funciones de seguridad críticas, como la autenticación de dos factores, no funcionarían correctamente. 
Las cookies también se utilizan para ofrecer publicidad personalizada. Al rastrear sus interacciones con nuestra Plataforma, podemos ofrecer anuncios que sean relevantes para sus intereses. Por ejemplo, las cookies nos permiten mostrarle promociones u ofertas relacionadas con los servicios en los que ha mostrado interés. Esto nos ayuda a ofrecer contenido que mejora su experiencia mientras aseguramos que la publicidad sea más dirigida y eficiente. 
Las cookies nos permiten recopilar datos analíticos sobre cómo se utiliza nuestra Plataforma. Estos datos nos ayudan a comprender el comportamiento de los usuarios, identificar áreas de mejora y tomar decisiones basadas en datos para mejorar nuestros Servicios. Al analizar métricas como las visitas a la página, las tasas de clics y la duración de las sesiones, podemos refinar continuamente la interfaz de usuario y la funcionalidad de nuestra Plataforma para satisfacer sus necesidades de manera más efectiva. 
En algunos casos, estamos obligados a utilizar cookies para cumplir con obligaciones legales, como garantizar el correcto procesamiento de transacciones o cumplir con los requisitos regulatorios. Las cookies nos ayudan a cumplir con estos requisitos de manera eficiente y a garantizar que nuestra Plataforma opere dentro de los límites de las leyes y regulaciones aplicables. 
  
5. Cookies de terceros 

5.1. A lo largo de la Plataforma, podemos proporcionar enlaces a sitios web o aplicaciones de terceros que son operados por socios externos de confianza. Estos sitios web de terceros pueden utilizar sus propias cookies, incluidas cookies analíticas, de rendimiento o de segmentación, de acuerdo con sus respectivas políticas de privacidad y cookies. 

5.2. Tenga en cuenta que estas cookies de terceros están regidas por las políticas de los sitios web externos, y Unique 1 Global no es responsable de las prácticas de estas plataformas de terceros. Para obtener información detallada sobre las cookies utilizadas por estos sitios web, consulte sus políticas individuales de privacidad y cookies. 

 

6. Cómo gestionar las cookies 

6.1. Para gestionar y personalizar sus preferencias de cookies, puede utilizar nuestra herramienta de consentimiento de cookies, que es accesible a través del enlace "Gestionar Cookies" en el pie de página de nuestro sitio web en . Esta herramienta le permite controlar sus preferencias para varios tipos de cookies, excepto aquellas que son estrictamente necesarias para el funcionamiento del sitio web. Puede seleccionar o deseleccionar cookies según sus preferencias, y esto se aplicará a sus futuras interacciones con nuestra Plataforma. 

6.2. Alternativamente, puede gestionar las cookies directamente a través de la configuración de su navegador. La mayoría de los navegadores ofrecen opciones para bloquear o eliminar cookies, así como para controlar los tipos específicos de cookies que acepta. Tenga en cuenta que deshabilitar una cookie o categoría de cookies no la eliminará de su navegador a menos que la elimine manualmente utilizando la función de su navegador. 

 

7. El derecho a deshabilitar cookies 

7.1. Las cookies estadísticas y de marketing se colocan en su dispositivo solo con su consentimiento, excepto aquellas que son esenciales para el funcionamiento técnico de la Plataforma. Estas cookies nos ayudan a entender el comportamiento de los usuarios y a personalizar su experiencia ofreciendo publicidad relevante. 

7.2. Si no desea aceptar las cookies estadísticas o de marketing, puede rechazarlas fácilmente haciendo clic en el botón "Rechazar" en el banner o aviso de consentimiento de cookies que se muestra en el sitio web. Esto evitará el uso de dichas cookies durante su sesión. 

7.3. Tenga en cuenta que optar por bloquear las cookies puede requerir que ajuste manualmente preferencias específicas cada vez que visite la Plataforma. Si bien deshabilitar las cookies puede mejorar su privacidad, también puede afectar la funcionalidad de algunas características o reducir el nivel de personalización disponible en Unique 1 Global. 

 

8. Cambios a esta Política 

8.1. Podemos actualizar periódicamente esta Política para reflejar cambios en nuestro uso de cookies, tecnologías relevantes o requisitos legales. La versión más reciente de esta Política, disponible en nuestra Plataforma, regirá el uso de cookies y otras tecnologías de seguimiento. Le recomendamos que revise esta Política regularmente para mantenerse informado sobre cómo usamos las cookies y cómo puede gestionarlas. 

8.2. En caso de que haya cambios o adiciones materiales a esta Política, le notificaremos por correo electrónico o mediante un aviso destacado en nuestra Plataforma. Al continuar utilizando nuestra Plataforma y Servicios después de cualquier actualización o cambio en esta Política, usted reconoce que ha revisado la política actualizada y consiente nuestro uso de cookies según lo descrito. 

 

9. Información de contacto 

Si tiene alguna pregunta, inquietud o solicitud relacionada con esta Política, o si desea ejercer sus derechos relacionados con sus datos personales, por favor contáctenos utilizando los siguientes datos: 

Teléfono: +371 254 93 902 
Email: support@uniqueoneglobal.com 
Dirección operativa: 2134203 en Virgin Islands (British). La oficina registrada se encuentra en Clarence Thomas Building, P.O. Box 4649, Road Town, Tortola 
 
Responderemos a su consulta o solicitud de manera oportuna y abordaremos cualquier inquietud que pueda tener sobre nuestro uso de cookies o datos personales. 

________________________________________________________________________________________________________________________________________________________________ 

 

Aviso de Riesgos  

 

Aviso de divulgación de riesgos 

 

Última actualización: 17 de octubre de 2024 
 Versión: 1.0 

 

1. Introducción 

1.1. Bienvenido al aviso de divulgación de riesgos de https://uniqueoneglobal.com (en adelante referido como "nosotros", "nos", “Unique 1 Global, la "plataforma", "sitio web").  

1.2. La Plataforma es operada por Unique One Global Ltd, una Compañía Internacional de Negocios número 2134203 en Virgin Islands (British). La oficina registrada se encuentra en Clarence Thomas Building, P.O. Box 4649, Road Town, Tortola. 

1.3. Las inversiones en instrumentos financieros están inherentemente sujetas a riesgos de mercado. Ciertos productos financieros, particularmente aquellos que involucran el intercambio de divisas, se caracterizan por una alta especulación, lo que requiere una inversión prudente con capital de riesgo exclusivamente. Participar en el comercio de divisas con margen implica un nivel sustancial de riesgo y puede no ser adecuado para todos los inversores. El apalancamiento, siendo un arma de doble filo, puede amplificar tanto las ganancias como las pérdidas. Antes de comprometerse con inversiones en divisas, es imperativo evaluar diligentemente los objetivos de inversión, el nivel de experiencia y la tolerancia al riesgo. Existe un escenario plausible en el que puede ocurrir una pérdida, parcial o total, de la inversión inicial. En consecuencia, se desaconseja encarecidamente invertir fondos que superen la capacidad financiera para absorber pérdidas. Es esencial conocer todos los riesgos asociados con el comercio de divisas, y se recomienda buscar el asesoramiento de un asesor financiero independiente. Al iniciar una cuenta de trading con nosotros, tú, como Usuario, certificas que comprendes los riesgos inherentes, posees la capacidad financiera y la preparación mental para los riesgos involucrados en especular o comerciar contratos u otros productos financieros de mercados extrabursátiles proporcionados por Unique 1 Global. Abogamos firmemente por leer y buscar asesoramiento profesional respecto a los riesgos que siguen. 

 

2. Divulgación de riesgos de CFDs 

2.1. Los CFDs, o contratos por diferencia, son contratos entre dos partes, a las que generalmente se refieren como "comprador" y "vendedor". En estos contratos, el vendedor se compromete a pagar al comprador la diferencia entre el valor actual del activo y su valor en el momento estipulado en el contrato. Si esta diferencia es negativa, será el comprador quien la abone al vendedor. En esencia, los CFDs funcionan como derivados financieros que permiten a los inversores a capitalizar los movimientos de precio, tanto ascendentes (posiciones largas) como descendientes (posiciones cortas), de los instrumentos financieros subyacentes. Suelen utilizarse con propósito especulativo en distintos mercados. 

2.2. Cuando se aplica a acciones, un CFD sirve como un derivado de acciones, ofreciendo a los inversores un medio para especular sobre las fluctuaciones de los precios de las acciones sin la necesidad de poseer las acciones subyacentes reales. 

2.3. Es crucial señalar que este documento no proporciona una divulgación completa de todos los riesgos asociados ni de otros aspectos críticos relacionados con los CFDs. No debe interpretarse como asesoramiento de inversión ni como una recomendación para participar en ningún servicio o invertir en cualquier instrumento financiero. 

2.4. Los usuarios potenciales deben abstenerse de ejecutar transacciones que involucren CFDs u otros instrumentos financieros a menos que posean una comprensión completa de su naturaleza, los riesgos inherentes y el grado de exposición a estos riesgos. En situaciones de incertidumbre sobre el significado de cualquiera de las advertencias detalladas en este documento, se aconseja a los usuarios buscar asesoramiento legal o financiero independiente antes de tomar cualquier decisión de inversión. 

2.5. El usuario también debe reconocer que: 

El valor de cualquier inversión en instrumentos financieros está sujeto a fluctuaciones, ya sea disminuyendo o aumentando, y existe la posibilidad de que la inversión pueda disminuir hasta el punto de volverse inútil. 
Los rendimientos pasados no deben ser considerados como indicativos de los rendimientos futuros potenciales. 
Participar en el comercio de instrumentos financieros puede implicar implicaciones fiscales y/o otros deberes. 
Las fluctuaciones en los tipos de cambio pueden tener efectos adversos sobre el valor, el precio y/o el rendimiento de los instrumentos financieros negociados en una moneda diferente a la moneda base del Usuario. 
  
3. Riesgos asociados con los CFDs 

3.1. Riesgo de apalancamiento 

El apalancamiento es una característica distintiva de los CFDs, lo que introduce un riesgo aumentado en comparación con las inversiones directas en los activos subyacentes. El sistema de margen aplicado a los CFDs involucra un depósito relativamente pequeño en relación con el tamaño de la transacción. En consecuencia, incluso un pequeño movimiento de precio en el activo subyacente puede tener un impacto desproporcionado en la operación del Usuario. Mientras que un movimiento favorable de precio puede generar altos rendimientos, un movimiento desfavorable puede llevar a pérdidas significativas rápidamente. 

3.2. Riesgo de deslizamiento 

El riesgo de deslizamiento se refiere a las fluctuaciones rápidas de los precios de los CFDs en los mercados financieros, lo que da lugar al riesgo de deslizamiento. El deslizamiento ocurre cuando los precios de los CFDs saltan rápidamente de un nivel a otro sin atravesar los niveles intermedios. Este movimiento rápido puede limitar la capacidad del Usuario para colocar órdenes entre los dos niveles de precio. 

Unique 1 Global ofrece la opción de implementar Órdenes de Stop Loss para mitigar las posibles pérdidas de una posición abierta. Estas órdenes cierran automáticamente las posiciones cuando se alcanza un límite de precio especificado. Sin embargo, ciertas situaciones, como movimientos rápidos de precios o el cierre del mercado, pueden hacer que el límite de 'stop loss' sea ineficaz. 

Para mantener abiertas las posiciones de CFDs, el usuario debe asegurarse de tener fondos suficientes en su cuenta para cubrir las obligaciones de margen. No cubrir las obligaciones de margen de manera oportuna puede requerir el depósito inmediato de fondos adicionales liberados o el cierre de posiciones. Las deficiencias de margen pueden surgir rápidamente con los cambios en los valores del mercado. Sin fondos suficientes, existe el riesgo de cierres involuntarios de posiciones. 

El valor de la cuenta del usuario debe mantenerse consistentemente por encima del nivel de liquidación o cierre. Si cae por debajo de este nivel, las operaciones de CFD del Usuario enfrentarán la posibilidad de liquidación. Para prevenir la liquidación, el Usuario debe depositar suficientes fondos para mantener el valor de la cuenta por encima del nivel de liquidación. En los casos en los que la operación del Usuario se desvíe de las expectativas, pueden ser necesarios depósitos adicionales de fondos para mantener la posición. 

3.3. Riesgo de pérdida de fondos invertidos 

Existe la posibilidad de que se presenten movimientos adversos del mercado, y dichos movimientos pueden llevar a la pérdida total de tu saldo de cuenta o incluso excederlo. Si tus pérdidas superan el saldo actual de tu cuenta, las consecuencias negativas de estos eventos adversos serán asumidas por nosotros, y tus pérdidas se limitarán al saldo vigente de tu cuenta en ese momento. 

3.4. Sin garantía de ganancia 

No hay garantías de ganancias ni inmunidad contra pérdidas en el trading de CFDs. Unique 1 Global y sus representantes no tienen la intención de proporcionar, ni pueden proporcionar, garantías de este tipo. Esta declaración sirve como una alerta para el Usuario de que existen riesgos inherentes asociados con el trading de CFDs. El Usuario debe poseer la capacidad financiera para soportar dichos riesgos y absorber cualquier pérdida resultante. 

Es esencial reconocer que no posees ni derechos ni obligaciones con respecto a los instrumentos o activos subyacentes vinculados a tu CFD. Los CFDs pueden tener diversos activos subyacentes, que abarcan acciones, índices y commodities. En el caso de un CFD de acciones, por ejemplo, no tendrás derecho a voto. Esta aclaración es particularmente relevante para que el Usuario comprenda las características distintivas de los CFDs en las diversas clases de activos. 

 

4. Divulgación de riesgos de CFDs 

4.1. El riesgo de pérdida en el trading de Forex (mercado de divisas) puede ser sustancial. Es crucial evaluar cuidadosamente si participar en este tipo de trading se ajusta a tu situación financiera. Al considerar si operar o autorizar a otra persona para que opere en tu nombre, es vital estar consciente de lo siguiente: 

Las transacciones de Forex, o mercado de divisas, no se realizan en una bolsa, y los fondos depositados con la contraparte para las transacciones de Forex pueden no tener las mismas protecciones que los fondos utilizados para margen o para garantizar contratos de futuros y opciones negociados en bolsa. 
En caso de insolvencia de la contraparte y tu reclamación por los montos depositados o las ganancias obtenidas en las transacciones de Forex, tu reclamación puede no tener prioridad. Sin prioridad, serías categorizado como un acreedor general, y tu reclamación, junto con otras reclamaciones generales, podría no ser satisfecha con los fondos restantes después de que se resuelvan las reclamaciones prioritarias. 
Incluso si los fondos del Usuario se mantienen separados de los fondos operativos de la contraparte, es posible que no estén completamente protegidos de las reclamaciones de otros acreedores generales y prioritarios. 
El alto grado de apalancamiento que a menudo está disponible en el trading de Forex puede jugar tanto a favor como en contra de ti, lo que podría resultar en pérdidas significativas. 
4.2. Es crucial señalar que esta breve declaración no puede cubrir todos los riesgos y aspectos significativos de los mercados de Forex (mercado de divisas). Se recomienda realizar más investigaciones y obtener un mayor entendimiento antes de participar en el trading de Forex. 

 

5. Riesgos asociados con los CFDs 

5.1. Inversión de alto riesgo 

El trading de divisas fuera de bolsa con margen implica un nivel sustancial de riesgo y puede no ser adecuado para todos los inversores. El apalancamiento considerable involucrado puede funcionar a tu favor o en tu contra. Antes de tomar la decisión de operar con divisas, es crucial considerar detenidamente tus objetivos de inversión, nivel de experiencia y apetito de riesgo. Existe la posibilidad de sufrir una pérdida de parte, la totalidad o más de tu inversión inicial. Por lo tanto, es imperativo no invertir dinero que no puedas permitirte perder. Ser consciente de todos los riesgos asociados con el trading de divisas es esencial, y se recomienda buscar asesoramiento de un asesor financiero independiente en caso de dudas. 

5.2. Riesgos del trading en Internet 

Utilizar un sistema de ejecución de operaciones basado en Internet introduce riesgos, incluyendo, pero no limitado a, fallos potenciales en hardware, software y conexión a Internet. Dado que Unique 1 Global no tiene control sobre la potencia de la señal, su recepción o enrutamiento a través de Internet, ni puede supervisar la configuración de tu equipo o la fiabilidad de su conexión, declinamos la responsabilidad por fallos de comunicación, distorsiones o retrasos durante el trading en línea. Unique 1 Global ha implementado sistemas de respaldo y planes de contingencia para minimizar el riesgo de fallos del sistema, y el trading telefónico está disponible en todo momento. 

5.3. Precisión de la información 

El contenido de este sitio web está sujeto a cambios sin previo aviso y se proporciona únicamente con el propósito de ayudar a los traders a tomar decisiones de inversión independientes. Si bien Unique 1 Global ha implementado medidas razonables para garantizar la exactitud de la información en el sitio web, no garantiza su precisión. Unique 1 Global no aceptará responsabilidad por cualquier pérdida o daño que pueda surgir directa o indirectamente del contenido o de tu incapacidad para acceder al sitio web, o por cualquier demora en o fallo en la transmisión o recepción de cualquier instrucción o notificación enviada a través de este sitio web. Se aconseja a los usuarios verificar de manera independiente la información y reconocer los riesgos inherentes asociados con el trading. 

 

6. Otros riesgos 

6.1. Riesgo de mercado 

El riesgo de mercado es la posible disminución del valor de un portafolio como resultado de cambios en factores del mercado tales como los precios de las acciones, tasas de interés, tipos de cambio y precios de commodities. En caso de fluctuaciones adversas de precios, el usuario enfrenta el riesgo de pérdida parcial o total del capital invertido. 

6.2. Riesgo sistémico 

El riesgo sistémico es la amenaza de un colapso en todo el mercado o sistema financiero. Abarca los riesgos asociados con las interdependencias en un sistema o mercado, donde la falla de una entidad o grupo de entidades puede desencadenar un efecto negativo en cascada, lo que potencialmente lleva al colapso de todo el sistema o mercado. 

6.3. Riesgo técnico 

El riesgo técnico involucra la posibilidad de fallos en los equipos electrónicos utilizados para el trading con margen y las operaciones de inversión, lo que puede llevar a resultados inesperados e impredecibles, resultando en pérdidas en el mercado de divisas internacional (Forex). Las transacciones realizadas a través de un sistema de trading electrónico exponen al Usuario a riesgos relacionados con posibles fallos del sistema, incluyendo fallos de equipos y software. 

6.4. Riesgo operacional 

El riesgo operacional es el riesgo de que las operaciones comerciales fallen debido a errores humanos. Este riesgo varía según las industrias y es una consideración crucial al evaluar decisiones de inversión potenciales. Las industrias con menor interacción humana probablemente tendrán un riesgo operacional más bajo. 

6.5. Riesgo país 

El riesgo país es el riesgo de que los rendimientos de una inversión se vean afectados por cambios políticos o inestabilidad en un país. La inestabilidad que afecta los rendimientos de la inversión podría surgir de cambios en el gobierno, órganos legislativos, responsables de políticas exteriores o control militar. 

6.6. Riesgo de tasa de interés 

El riesgo de tasa de interés es el cambio potencial en el valor de una inversión debido a un cambio en las tasas de interés absolutas, el diferencial entre dos tasas, la forma de la curva de rendimientos o cualquier otra relación de tasas de interés. El riesgo de tipo de cambio es el riesgo de que el valor de una inversión se vea afectado por cambios en las tasas de cambio. 

6.7. Riesgo regulatorio 

El riesgo regulatorio involucra el impacto potencial en el valor de una inversión debido a cambios en las leyes o regulaciones por parte del gobierno o los órganos reguladores. Tales cambios pueden aumentar los costos operativos, reducir la atractividad de una inversión, alterar el panorama competitivo y afectar materialmente el potencial de ganancias de la inversión. Este riesgo es impredecible y puede variar dependiendo del mercado para el activo subyacente de un CFD determinado y/o la inversión en Forex. 

6.8. Riesgos del trading electrónico y en línea 

Participar en el trading en línea conlleva riesgos inherentes debido a las posibles variaciones en los tiempos de respuesta del sistema y la disponibilidad de acceso, influenciados por las condiciones del mercado, el rendimiento del sistema y otros factores. Es imperativo que comprendas estos riesgos junto con consideraciones adicionales antes de participar en actividades de trading. Como Usuario, eres responsable de abordar problemas técnicos, incluyendo, pero no limitado a: 

Funcionalidad de hardware y software. 
Fiabilidad de la conexión a Internet. 
Instalación y configuración de MetaTrader. 
Compatibilidad de las plataformas de trading en PC y dispositivos móviles. 
Suministro eléctrico para respaldar operaciones de trading ininterrumpidas. 
6.9. Riesgo de criptomonedas 

El trading de criptomonedas con margen implica un nivel sustancial de riesgo y puede no ser adecuado para todas las personas. El rendimiento pasado no es indicativo de resultados futuros. Antes de participar en el trading de criptomonedas, es imperativo considerar cuidadosamente los objetivos personales, el nivel de experiencia y el apetito de riesgo. Existe la posibilidad de perder parte o la totalidad del depósito inicial; por lo tanto, los fondos solo deben invertirse si se pueden permitir pérdidas. Se recomienda estar plenamente consciente de los riesgos asociados con el trading de criptomonedas y buscar el asesoramiento de un asesor financiero independiente en caso de dudas. 

6.10. Riesgo de apalancamiento y trading con margen por parte de traders o agentes de terceros 

Está estrictamente prohibido que el usuario utilice cualquier servicio de traders o agentes de terceros para operar o utilice cualquier servicio de la plataforma en nombre del usuario. Sin embargo, si un usuario de Unique 1 Global decide utilizar tales servicios y revela información personal, debe entender que la seguridad de su información personal se convierte en responsabilidad de dichos traders o agentes de terceros. Unique 1 Global no asume ninguna responsabilidad por las políticas de privacidad de sitios web externos de dichos traders o agentes de terceros contratados por el usuario. 

Unique 1 Global no está obligado a revisar los traders o agentes de terceros seleccionados por los usuarios para gestionar sus cuentas y no es responsable de las pérdidas incurridas por tales usuarios. Los usuarios son responsables de su decisión de nombrar y autorizar a dichas partes. Las disputas derivadas de estas relaciones deben resolverse entre el usuario y los traders o agentes de terceros autorizados. Unique 1 Global solo reconoce las operaciones ejecutadas desde el terminal de la cuenta de trading del usuario y no será responsable del acceso a la cuenta o ejecución de operaciones por otros medios. Se recomienda encarecidamente ejercer precaución y mantener la seguridad de las contraseñas de trading para evitar disputas. 

6.11. Riesgo de deslizamiento 

El compromiso de Unique 1 Global de no buscar compensación por deslizamiento y su obligación de ejecutar Órdenes de Stop Loss al precio de stop loss o mejor no se aplican a las Órdenes Limit y Stop Loss durante las horas de mercado, incluyendo los picos de precio. Aunque las Órdenes de Stop Loss o las Órdenes Stop Limit destinadas a limitar las pérdidas pueden reducir las pérdidas incurridas por fluctuaciones de precio, la ejecución bajo ciertas condiciones del mercado, como la publicación de noticias o indicadores económicos clave, puede no ser posible. Unique 1 Global no es responsable de ninguna pérdida o daño, incluyendo la pérdida de beneficios, que surja directa o indirectamente debido a la volatilidad del mercado o condiciones anormales del mercado. 

6.12. Riesgo de ejecución de operaciones 

Una vez que se ejecutan las operaciones desde el terminal de la cuenta del usuario, no pueden ser canceladas o revertidas. Cualquier otra instrucción relacionada con una operación particular no se aplicará hasta que se complete la ejecución. Los usuarios deben verificar los detalles de la operación, como volumen, producto, niveles de precio, puntos de entrada y salida deseados, antes de ejecutar las operaciones. Las transacciones comerciales se realizan en un sistema de primero en entrar, primero en salir. 

6.13. Riesgo de quiebra e insolvencia de Unique 1 Global 

En caso de quiebra o insolvencia de Unique 1 Global, se dará prioridad a los acreedores. Las operaciones/contratos/transacciones ejecutadas en Unique 1 Global no se negocian en bolsas, y la protección de los fondos de los usuarios difiere de la de los fondos negociados en bolsa. En caso de insolvencia de Unique 1 Global, los usuarios serán pagados con los fondos disponibles después de que se resuelvan las reclamaciones prioritarias. 

6.14. Riesgo de estrategias de trading 

Todas las estrategias de trading se utilizan bajo el propio riesgo del usuario. El contenido en uniqueoneglobal.com no debe considerarse como asesoramiento ni interpretarse como una recomendación para participar en ningún servicio o invertir en cualquier instrumento financiero. Es responsabilidad del usuario confirmar y decidir sobre las operaciones, utilizando capital de riesgo: operar con dinero que, si se pierde, no afectará negativamente su estilo de vida ni sus obligaciones financieras. Los resultados pasados no indican el rendimiento futuro. En ningún caso el contenido de esta correspondencia debe interpretarse como una promesa o garantía expresa o implícita. Unique 1 Global no es responsable de las pérdidas incurridas debido a las estrategias de trading. Las estrategias que limitan las pérdidas, como las órdenes de stop loss, pueden ser ineficaces debido a las condiciones del mercado o problemas tecnológicos. De manera similar, las estrategias que utilizan combinaciones de opciones y/o posiciones en futuros pueden ser igual de riesgosas que las posiciones simples largas y cortas. No se implica ni es posible ninguna garantía al intentar proyectar condiciones futuras. 

 

4. Riesgos fuera del control de la plataforma 

7.1. El Usuario, y no la plataforma, asume toda la responsabilidad por los siguientes riesgos, cuya enumeración no es exhaustiva: 

Falta de conocimiento de la configuración del terminal de la cuenta de trading. El usuario es responsable de cualquier falta de familiaridad con la configuración del terminal de la cuenta de trading. 
Fallos técnicos en el software del usuario. El usuario asume la responsabilidad de cualquier mal funcionamiento técnico que ocurra en su software. 
Divulgación de credenciales de registro a terceros al abrir la cuenta real. El usuario es completamente responsable de cualquier compartición no autorizada de las credenciales de registro al abrir una cuenta real. 
Acceso no autorizado por parte de un tercero a la cuenta de correo electrónico personal del usuario. El usuario asume plena responsabilidad por el acceso no autorizado a su cuenta de correo electrónico personal por parte de terceros. 
Lectura con demora de la información enviada a la dirección de correo electrónico del usuario. Los retrasos en la lectura de la información enviada a la dirección de correo electrónico del usuario son responsabilidad del usuario. 
Cualquier otra circunstancia de fuerza mayor por parte del usuario. El usuario es responsable de cualquier otra circunstancia imprevista fuera del control de la plataforma. 
7.2. Unique 1 Global rechaza explícitamente cualquier responsabilidad por pérdida o daño, incluyendo, pero no limitado a, la pérdida de beneficios, que surja directa o indirectamente por errores humanos o problemas técnicos. Los riesgos asociados con el uso de un sistema de ejecución de operaciones de trading basado en Internet abarcan fallos potenciales en hardware, software y conexiones a Internet. Dado que Unique 1 Global no tiene control sobre la potencia de señal, la recepción o el enrutamiento a través de Internet, así como la configuración y fiabilidad de tu equipo, la empresa no puede ser responsabilizada por fallos de comunicación, distorsiones o retrasos durante el trading en línea. Unique 1 Global ha implementado sistemas de respaldo y planes de contingencia para minimizar la probabilidad de fallos del sistema. 

________________________________________________________________________________________________________________________________________________________________ 

 

Eliminación de datos personales  

 

Eliminación de datos personales. 

 

¿Cómo puedo asegurarme de que mis datos personales se eliminarán de Unique 1 Global después de cerrar mi cuenta? 

 

Una vez cerrada tu cuenta, dejaremos de recoger tu información y tu dirección de correo electrónico se eliminará de nuestra lista de correo. 

 

Si deseas que eliminemos tus datos, sólo tienes que ponerte en contacto con nosotros enviando un correo electrónico a support@uniqueoneglobal.com desde la dirección de correo electrónico vinculada a tu cuenta de Unique 1 Global. Escribe «Solicitud de eliminación de datos» en el asunto. Nuestro equipo procesará rápidamente tu solicitud y te responderá en un plazo de cinco días laborables. 

 

Para cumplir las normas reglamentarias y nuestros términos y condiciones, estamos obligados a conservar algunos de sus registros durante algunos años después del cierre de la cuenta. 

 

Para más detalles sobre nuestra política de privacidad, consulta: Política de privacidad 

________________________________________________________________________________________________________________________________________________________________ 

 

Términos y condiciones del bono del crédito  

 

Términos y Condiciones del Bono de Crédito de Unique 1 Global  

Última actualización: enero de 2025 

Emitido por: Unique One Global Ltd (IBC No. 3882-499234) 

Oficina registrada: 2134203 en Virgin Islands (British). La oficina registrada se encuentra en Clarence Thomas Building, P.O. Box 4649, Road Town, Tortola. 

 

1. Introducción 

Estos Términos y Condiciones ("Términos") regulan la emisión y uso del Crédito de Bonificación ("Bonificación") proporcionado por Unique One Global (“Unique 1 Global“, "nosotros") a clientes elegibles ("Cliente", "tú"). Al aceptar la Bonificación, el Cliente confirma su aceptación total y cumplimiento de estos Términos. 

 

2. Naturaleza y propósito del Crédito Bonus 

2.1. El Bono es un crédito de trading no retirable otorgado a discreción exclusiva de Unique 1 Global. 

2.2. El Bono se refleja como "Crédito" en tu cuenta de trading y está destinado únicamente como margen de respaldo para aumentar tu capacidad de operación 

2.3. Las ganancias generadas por operaciones con el Bono se pueden retirar por completo, sujetas a la verificación exitosa del Departamento de Cumplimiento 

2.4. El monto del Bono no se puede retirar, transferir, convertir en efectivo ni usar fuera de la plataforma. 

2.5. El Bono no cubre pérdidas: si tu equity cae hasta el valor del Bono o por debajo, el Bono se elimina automáticamente y las posiciones abiertas pueden cerrarse a la fuerza. 

2.6. Cada cliente puede recibir un solo bono por cuenta, a menos que se autorice explícitamente lo contrario. 

2.7. El bono se elimina con cualquier retiro, sin importar el monto. Luego podrías ser elegible para un nuevo bono, a discreción de Unique 1 Global. 

 

3. Restricciones y Limitaciones 

3.1. El Bono de Crédito acumulado máximo entre todas las cuentas de un mismo Cliente no puede superar los USD $10,000 

3.2. Los bonos no se pueden transferir entre usuarios ni cuentas. 

3.3. Cualquier forma de abuso, incluyendo pero no limitada a arbitraje, cobertura entre cuentas, explotación de latencia o trading coordinado para obtener ganancias sin riesgo, resultará en la cancelación inmediata del Bono y puede llevar a la suspensión de tu cuenta. 

 

4. Escenarios ilustrativos: retiro del bono y retiro de ganancias 

Escenario A: Retiro con ganancia (Bono eliminado) 

El cliente deposita $1,000 en fondos reales. 
Unique 1 Global te da un Bono de Crédito de $1,000 (Capital total = $2,000). 
Cliente gana $600 de profit con trading. 
Al solicitar un retiro de $1,000, se elimina el Bono. 
Saldo después del retiro: 
 - Fondos reales + Ganancia = $1,600 
 - Crédito = $0 
Resultado: Te quedas con las ganancias; el bono se elimina. Puedes solicitar un nuevo bono. 
Escenario B: Pérdidas activan la eliminación automática del bono 

Configuración inicial igual que arriba. 
Pérdida no realizada de $1,000 en trading. 
El equity baja a $1,000, igualando el valor del Bono de Crédito. 
Bono eliminado por no participar en pérdidas. 
Capital restante: $0 
Resultado: Todas las posiciones cerradas por stop-out; Bono perdido. 
  
5. Derechos y Descargos de responsabilidad de Unique 1 Global 

Unique 1 Global se reserva el derecho unilateral de: 

Rechazar otorgar un Bono a cualquier Cliente a su discreción; 
Modificar, suspender o finalizar el programa de Bonos en cualquier momento sin previo aviso; 
Eliminar un Bono activo en casos de abuso, inactividad, comportamiento sospechoso o incumplimiento de los Términos; 
Suspende o cancela cuentas que violen los Términos del Bono o las condiciones generales de la plataforma. 
El programa de Bonos puede cambiar sin previo aviso. Unique 1 Global no se hace responsable de pérdidas directas o indirectas por la eliminación del Bono. 

 

6. Reconocimiento Legal 

Al participar en el programa de Bonos, el Cliente: 

Reconoce y acepta todas las cláusulas aquí contenidas; 
Entiende que el Bono no es capital libre de riesgo; 
Acepta que cualquier ganancia obtenida del Bono depende de la revisión de cumplimiento y de los términos de la plataforma. 
Unique 1 Global promueve el trading responsable y te anima a gestionar el riesgo de forma adecuada. 

________________________________________________________________________________________________________________________________________________________________ 

 

Política sobre gestión de reclamaciones 

 

Política de manejo de quejas 

Última actualización: 17 de octubre de 2024 

Versión: 1.0 

 

1. Introducción 

1.1. Este aviso de política de manejo de quejas describe las pautas y procedimientos establecidos por (en adelante referido como "nosotros", "nos", “Unique 1 Global“, la plataforma) para manejar las quejas de nuestros usuarios. Los términos definidos en nuestros términos y condiciones tendrán el mismo significado en este procedimiento de manejo de quejas, a menos que se definan de otra manera. La plataforma es operada por Unique One Global Ltd, una Compañía Internacional de Negocios número 3882-499234 en Santa Lucía. La oficina registrada se encuentra en Virgin Islands (British). La oficina registrada se encuentra en Clarence Thomas Building, P.O. Box 4649, Road Town, Tortola. 

1.2. Unique 1 Global ha designado a un oficial de cumplimiento para manejar eficazmente las quejas de los usuarios, facilitando una pronta resolución e implementando las medidas necesarias para prevenir problemas recurrentes. 

 

2. Definición 

2.1. Una queja, según Unique 1 Global, es cualquier objeción o insatisfacción expresada por un usuario con respecto a los servicios proporcionados por la plataforma. Se adjunta un formulario de queja a esta política. 

 

3. Procedimiento 

3.1. El oficial de cumplimiento es responsable de abordar las quejas de los usuarios, excepto cuando la queja involucra al oficial de cumplimiento, en cuyo caso el representante del oficial la manejará. 

3.2. Para ayudar en el procesamiento de quejas, debes proporcionar la siguiente información: 

Tu número de cuenta de trading. 
Tu nombre/apellido/dirección de correo electrónico. 
Fecha del evento. 
Causa de tu queja (elige una): 
 - ejecución de órdenes; 
 - calidad o falta de información proporcionada; 
 - términos del contrato/tasas/cargos; 
 - administración general/servicio al cliente; 
 - problema relacionado con la retirada de fondos; 
 - cualquier otra causa. 
Detalles de la persona o departamento de Unique 1 Global a quien crees que debe dirigirse la queja. 
3.3. Todas las quejas de los usuarios deben ser presentadas por escrito, siendo lo más descriptivas posibles respecto a los eventos que llevaron a la queja. Unique 1 Gobal se reserva el derecho de no revisar quejas verbales o reclamaciones que carezcan de detalles significativos, como la fecha del evento, las posiciones afectadas y/o el monto de compensación solicitado. 

3.4. El usuario puede registrar una queja comunicándola a través de cualquiera de las siguientes opciones: 

 

Correo electrónico: support@uniqueoneglobal.com 

Dirección postal: Unique One Global Ltd, 2134203 en Virgin Islands (British). La oficina registrada se encuentra en Clarence Thomas Building, P.O. Box 4649, Road Town, Tortola. 

3.5. Al recibir la queja del usuario, el oficial de cumplimiento enviará un acuse de recibo por escrito dentro de los 7 días hábiles. 

3.6. Unique 1 Global tiene como objetivo proporcionar una respuesta final dentro de los 14 días. Si no es posible hacerlo, el oficial de cumplimiento notificará al usuario por escrito, indicando los motivos de la demora y proporcionando un tiempo estimado de resolución. 

3.7. Se debe dar una respuesta final al usuario dentro de los 60 días hábiles desde la fecha de presentación de la queja. 

3.8. Si el reclamante sigue insatisfecho con la respuesta final de Unique 1 Global, puede remitir la queja, junto con una copia de la respuesta final, a la Autoridad Reguladora de Servicios Financieros (FSRA) para su examen adicional. 

 

4. Registros del usuario 

4.1. Los usuarios deben proporcionar toda la documentación relevante y toda la información adicional solicitada por el agente de cumplimiento para asegurar el registro adeucado y la resolución a tiempo de la reclamación. 

4.2. Todos los registros se almacenarán de manera segura en cumplimiento con los requisitos locales durante un período de hasta siete años. 

________________________________________________________________________________________________________________________________________________________________ 

 

 

Política de Privacidad 

Última actualización: 1 de agosto de 2025 

Versión: 1.1 

 

1. Introducción 

1.1. Unique 1 Global es una plataforma digital de trading integral gestionada por Unique One Global Ltd, una empresa registrada como International Business Company (IBC) en Saint Lucia, bajo el número de empresa 3882-499234, con la oficina registrada ubicada 2134203 en Virgin Islands (British). La oficina registrada se encuentra en Clarence Thomas Building, P.O. Box 4649, Road Town, Tortola.  

(en adelante - “nosotros”,“nuestro”,“nos” o “Unique One Global”). 

1.2. Unique 1 Global opera a través de un sitio web, disponible en https://uniqueoneglobal.com, y una aplicación móvil (en adelante -“Plataforma” o “Unique One Global”). Esta Plataforma permite a los usuarios participar en actividades de trading, incluyendo Contratos por Diferencia (CFDs, por sus siglas en inglés) sobre varios valores, instrumentos derivados, copy trading e inversión en carteras diversificadas (en adelante, “Servicios”), una lista completa y descripciones detalladas de nuestros Servicios están disponibles en los Términos y Condiciones, los cuales le animamos a que revise. Como parte de nuestro compromiso de proporcionar un entorno robusto y seguro, Unique 1 Global ofrece herramientas y características que permiten a los usuarios tomar decisiones informadas en su trayectoria de trading. 

1.3. La Plataforma ha sido diseñada para operar en estricta conformidad con todos los marcos legales y regulatorios aplicables, asegurando que todas las interacciones se manejen de acuerdo con las leyes locales e internacionales aplicables. 

1.4. Esta Política de Privacidad describe cómo y por qué Unique 1 Global recopila, almacena, procesa, utiliza, comparte, transfiere y retiene sus datos personales (en adelante, la "Política") cuando interactúa con nuestros Servicios, ya sea a través de nuestro sitio web, aplicación móvil o cualquier otro producto o servicio en línea que ofrecemos. También se aplica cuando se comunica con nosotros o recibe comunicaciones de nuestra parte de cualquier forma. 

1.5. Al utilizar nuestros Servicios o visitar nuestra Plataforma, usted consiente explícitamente la recopilación, el procesamiento y la compartición de sus datos personales tal como se describe en esta Política. 

1.6. Podemos actualizar periódicamente esta Política, y la versión más reciente, disponible en nuestra Plataforma, regirá el procesamiento de sus datos personales. Le recomendamos que revise esta Política regularmente para mantenerse informado sobre cómo estamos protegiendo su información. En caso de que haya cambios o adiciones materiales a esta Política, le notificaremos por correo electrónico. Cuando la ley lo exija, también solicitaremos su consentimiento o le ofreceremos una oportunidad de exclusión para cualquier nuevo uso de su información personal. Al continuar utilizando nuestros Servicios después de cualquier actualización o cambio en esta Política, usted reconoce que ha revisado la Política actualizada y consiente el procesamiento de sus datos personales según lo descrito. 

1.7. En Unique 1 Global, estamos comprometidos a garantizar la privacidad y seguridad de los datos de nuestros usuarios. Recopilamos y procesamos información personal que es necesaria para fines comerciales legítimos, asegurando la transparencia al notificar a los usuarios en el momento de la recopilación. Retenemos sus datos personales solo durante el tiempo necesario para cumplir con los fines para los cuales fueron recopilados, a menos que se requiera un período de retención más largo para el cumplimiento legal o para defendernos contra reclamaciones legales. 

1.8. Es crucial que revise esta Política junto con cualquier otra política y documento que se publiquen y estén disponibles para su revisión en la Plataforma, para que esté completamente informado sobre cómo y por qué utilizamos sus datos personales. 

 

2. Responsabilidad de Unique 1 Global y propósito de esta Política 

2.1. Unique 1 Global, como entidad responsable, se dedica a recopilar, procesar y salvaguardar sus datos personales cuando interactúa con nuestra Plataforma. Esta Política de Privacidad tiene como objetivo informarle sobre cómo y por qué recopilamos, usamos y protegemos sus datos mientras accede y utiliza nuestros Servicios. 

2.2. Respetamos su privacidad y estamos completamente comprometidos a garantizar que sus datos personales sean tratados con los más altos estándares de seguridad y confidencialidad. Unique 1 Global asume toda la responsabilidad por la recopilación y el procesamiento de sus datos, y hacemos todo lo posible para proteger su información contra el acceso no autorizado, la pérdida o el uso indebido. 

2.3. Los objetivos principales de esta Política son: 

asegurar que esté completamente informado sobre los tipos de datos personales que recopilamos, los métodos que utilizamos para procesarlos y los propósitos específicos para los cuales se utilizan; 
cumplir con nuestras obligaciones bajo las leyes aplicables, incluidas las regulaciones de prevención de lavado de dinero (en adelante, “AML”, por sus siglas en inglés) y de conocimiento del cliente (en adelante, “KYC”, por sus siglas en inglés), y asegurar que nuestra Plataforma permanezca segura y cumpla con los estándares internacionales; 
mejorar su experiencia en Unique 1 Global proporcionando servicios personalizados, incluyendo contenido adaptado, herramientas de trading y notificaciones relevantes para sus actividades y preferencias; 
implementar las medidas técnicas y organizativas necesarias para proteger sus datos personales contra riesgos potenciales, incluyendo acceso no autorizado, alteración o divulgación. 
2.4. A través de esta Política, nuestro objetivo es proporcionar información clara sobre cómo se maneja su información personal por parte de Unique 1 Global, ayudándole a tomar decisiones informadas respecto a su privacidad. Seguimos dedicados a proteger su información personal y mantener su confianza. 

 

3. Definiciones 

3.1. A los efectos de esta Política, los siguientes términos tienen los significados que se indican a continuación: 

"Cookies", pequeños archivos de texto colocados en su dispositivo para mejorar su experiencia de navegación, utilizados para almacenar preferencias, rastrear actividades y analizar el tráfico del sitio. 

"Titular de los datos", una persona a la que se refieren los datos personales, es decir, usted, el usuario, cuyos datos están siendo recopilados y procesados por Unique 1 Global. 

"Datos personales" - cualquier información relacionada con una persona física identificada o identificable, incluyendo, pero no limitándose a, nombre, dirección de correo electrónico, número de teléfono, datos financieros y otra información que pueda ser utilizada para identificar o contactarlo. 

"Tratamiento", cualquier operación o conjunto de operaciones realizadas sobre datos personales, ya sea por medios automatizados o no, incluyendo la recopilación, almacenamiento, uso, modificación, recuperación, divulgación o eliminación. 

"Datos sensibles" se refiere a cualquier dato personal que, debido a su naturaleza, requiere un nivel más alto de protección. Esto incluye, pero no se limita a, datos como el origen racial o étnico, opiniones políticas, creencias religiosas o filosóficas, información de salud, datos biométricos, orientación sexual, datos genéticos y otra información que se clasifique como sensible según las leyes de protección de datos aplicables. 

3.2. Tenga en cuenta que todas las demás definiciones, particularmente aquellas relacionadas con los servicios y actividades específicas de Unique 1 Global, se pueden encontrar en los Términos y Condiciones y otros documentos disponibles para revisión en nuestra Plataforma. Estos documentos y políticas proporcionan detalles adicionales sobre nuestros Servicios, derechos y obligaciones de los usuarios, y más. 

 

4. Aplicabilidad 

4.1. Esta Política se aplica a todos los usuarios que interactúan con o visitan la Plataforma. Esto incluye tanto a los usuarios registrados como a los visitantes no registrados: 

Los visitantes se refieren a las personas que visitan y navegan por la Plataforma sin crear una cuenta o interactuar con los Servicios. Incluso si simplemente estás explorando o revisando el contenido proporcionado en la Plataforma, aún recopilamos ciertos tipos de datos para mejorar tu experiencia de navegación y mantener la funcionalidad de la Plataforma. 
Los usuarios registrados se refieren a individuos que se han registrado para obtener una cuenta en Unique 1 Global y utilizan activamente los Servicios. Para los usuarios, recopilamos datos personales adicionales necesarios para proporcionar nuestros Servicios, como información personal, detalles financieros e historial de transacciones. 
Dependiendo de la naturaleza de su interacción con la Plataforma, los tipos de datos personales que recopilamos pueden variar. En ambos casos, Unique 1 Global asegura que sus datos personales se procesen de acuerdo con esta Política y en cumplimiento con las leyes de protección de datos aplicables. Ya sea que esté simplemente visitando nuestra Plataforma o usándola activamente, su privacidad es nuestra máxima prioridad. 

 

5. Tipos de datos que recopilamos 

5.1. En Unique 1 Global, recopilamos varios tipos de datos personales dependiendo de su interacción con nuestra Plataforma. Los datos que recopilamos son esenciales para proporcionar nuestros Servicios, garantizar su seguridad y mejorar su experiencia general. A continuación se presentan las categorías de datos que recopilamos: 

Datos de identidad: nombre completo (primer y segundo nombre) o partes de los mismos; nombre de usuario o un identificador comparable; estado civil; título; nacionalidad; fecha y lugar de nacimiento; número de identificación fiscal; género; información de documentos de identidad, incluidos los detalles biométricos (por ejemplo, imágenes faciales). 
Datos de contacto: dirección de facturación; dirección residencial; dirección de correo electrónico; número de teléfono. 
Datos de evaluación previa: asociaciones cercanas; antecedentes políticos; información vinculada a sanciones y medios adversos. 
Datos de evaluación de riesgos: puntuación de riesgo del cliente; categorización de riesgo del cliente. 
Datos económicos y de idoneidad: estado laboral; ingresos anuales; fuente de ingresos; valor actual de la riqueza; planes de inversión anuales; objetivos de inversión; experiencia en trading; nivel de educación. 
Datos financieros: detalles de la cuenta bancaria; detalles de la tarjeta de pago. 
Datos de transacción: información sobre las transacciones, incluidos los detalles de pago, retiros, intercambios, historial de operaciones, ganancias, saldo de la cuenta, métodos de depósito y retiro, y cualquier otra información relevante. 
Datos técnicos: dirección de Protocolo de Internet (IP, por sus siglas en inglés); datos de inicio de sesión; tipo y versión del navegador; configuración y ubicación de la zona horaria; tipos y versiones de complementos del navegador; sistema operativo y plataforma; otra tecnología en los dispositivos utilizados para acceder a los Servicios; obtención de datos personales de varios terceros y fuentes públicas, incluidos datos técnicos de proveedores de análisis como Google, redes publicitarias y proveedores de información de búsqueda. 
Datos de comunicación: detalles sobre los pagos realizados y recibidos por usted en relación con nuestros Servicios. 
Datos de perfil: nombre de usuario y contraseña; sus intereses; preferencias; comentarios; respuestas a encuestas. 
Datos de uso: información relacionada con cómo accede y utiliza nuestros Servicios, incluyendo sesiones de usuario y, en ciertos casos, grabaciones de pantalla. 
5.2. Los tipos de datos personales mencionados anteriormente recopilados por Unique 1 Global pueden clasificarse según diferentes criterios de la siguiente manera: 

 

5.2.1. Basado en cómo se recopilan los datos 

Datos recopilados directamente que usted proporciona directamente a Unique 1 Global a través de interacciones en nuestra Plataforma, como cuando crea una cuenta, realiza una transacción o envía una solicitud de soporte. Ejemplos incluyen su nombre, dirección de correo electrónico, detalles de pago y cualquier dato enviado para fines de cumplimiento; 
Datos recopilados automáticamente que se recogen automáticamente a través de su interacción con nuestra Plataforma o a través de su dispositivo cuando accede a nuestro sitio web o aplicación. Ejemplos incluyen direcciones IP, información del dispositivo, historial de navegación y datos de uso rastreados a través de cookies. 
 

5.2.2. Basado en la fuente de datos 

Datos de primera parte que recopilamos directamente de usted a través de su interacción con la Plataforma, como durante la creación de la cuenta, las transacciones y la comunicación con el soporte. 
Datos de terceros que podemos recibir de fuentes externas, como procesadores de pagos, servicios de verificación de identidad u otras plataformas de terceros que utilizamos con fines de marketing o mejora del servicio. Esto también puede incluir datos de organismos reguladores para fines de cumplimiento (por ejemplo, verificaciones KYC). 
5.3. Además de los datos personales, también podemos recopilar y procesar ciertos datos agregados que se refieren a información estadística o demográfica recopilada para diversos fines. Aunque estos datos pueden derivarse de sus datos personales, no se clasifican como datos personales según la ley porque no revelan directa o indirectamente su identidad. Por ejemplo, los datos agregados podrían implicar compilar sus datos de uso para determinar el porcentaje de usuarios que interactúan con una función particular o expresan preferencias por servicios específicos. Sin embargo, si combinamos datos agregados con otros datos de una manera que podría potencialmente identificarle, trataremos estos datos combinados como datos personales y los procesaremos de acuerdo con las disposiciones establecidas en esta Política. 

 

6. Cómo Unique 1 Global recopila tus datos personales 

6.1. Unique 1 Global recopila datos personales a través de varios métodos y fuentes. Recopilamos estos datos para garantizar el funcionamiento sin problemas de nuestros Servicios, mejorar la experiencia del usuario y cumplir con las obligaciones legales. A continuación, se presenta un desglose detallado de las diferentes formas en que recopilamos sus datos personales: 

6.2. Recopilamos datos personales directamente de usted cuando los proporciona en diversas interacciones en nuestra Plataforma. Estas interacciones incluyen, pero no se limitan a, los siguientes escenarios: 

cuando se registra para una cuenta, actualiza su perfil, completa la verificación o hace cambios en la configuración de su cuenta; 
cuando nos contacta por correo electrónico, o a través de nuestros servicios de atención al cliente para consultas, soporte técnico o cualquier otra asistencia relacionada con el servicio; 
cuando se suscribe a nuestros boletines, ofertas promocionales o actualizaciones sobre los Servicios. Esto incluye establecer preferencias para la comunicación y los materiales de marketing; 
cuando complete formularios o encuestas proporcionadas por Unique 1 Global para obtener retroalimentación, investigación o fines de mejora del servicio; 
si participa en concursos, promociones u otras actividades de marketing ofrecidas por Unique 1 Global. 
Los datos recopilados durante estas interacciones pueden incluir su nombre, información de contacto, detalles financieros, historial de transacciones y cualquier otra información que proporcione voluntariamente. 

6.3. Además, podemos recopilar datos personales automáticamente a través de sus interacciones con nuestra Plataforma. Este tipo de recopilación de datos ocurre mientras utiliza la Plataforma y puede incluir lo siguiente: 

datos sobre sus actividades en la Plataforma, como las páginas que visita, las funciones que utiliza y las acciones que realiza (por ejemplo, realizar operaciones, gestionar su cartera). Estos datos nos ayudan a mejorar la funcionalidad y el rendimiento y a entender cómo los usuarios interactúan con nuestros Servicios; 
datos técnicos sobre los dispositivos que utiliza para acceder a nuestros Servicios, como el tipo de dispositivo, el sistema operativo, el tipo de navegador, la dirección IP y los identificadores únicos del dispositivo. Esta información nos ayuda a optimizar la funcionalidad de la Plataforma para diferentes dispositivos y sistemas; 
información sobre su ubicación geográfica, que puede derivarse de su dirección IP o de los servicios de ubicación habilitados en su dispositivo. Esto se utiliza con fines de seguridad, localización de contenido y ofertas de servicios regionales; 
incluye registros del servidor que contienen direcciones IP, marcas de tiempo, tipo de navegador y otros detalles técnicos relacionados con su acceso y uso de la Plataforma. 
Estos datos se recopilan automáticamente a través de tecnologías como las cookies, que nos ayudan a monitorear, mejorar y personalizar su experiencia. 

6.4. También podemos recibir datos personales de fuentes externas. Estas fuentes de terceros pueden incluir: 

si interactúa con nosotros a través de canales de redes sociales como Facebook, Instagram, LinkedIn, etc., podemos recopilar datos públicos de sus perfiles para ofrecer servicios personalizados y comunicaciones de marketing; 
de motores de búsqueda que nos permiten comprender mejor sus intereses y mejorar cómo encuentra e interactúa con nuestros Servicios; 
datos disponibles públicamente de registros de empresas, como detalles de registro comercial, que pueden ayudar a verificar su identidad y cumplir con los requisitos legales; 
instituciones financieras y procesadores de pagos que pueden proporcionarnos datos de transacciones para verificación, prevención de fraudes y para procesar depósitos o retiros; 
servicios de terceros que nos ayudan a verificar su identidad y realizar las verificaciones KYC necesarias; 
socios que entregan anuncios en nuestro nombre, ayudándonos a rastrear la participación de los usuarios y refinar las estrategias de marketing. 
empresas analíticas externas que nos proporcionan datos de uso agregados y conocimientos para mejorar la funcionalidad de la Plataforma y la experiencia general del usuario. 
Estas fuentes externas proporcionan información valiosa que nos ayuda a mejorar su experiencia, cumplir con los requisitos legales y proteger sus datos personales contra el fraude o el uso indebido. 

 

7. Razones para el uso de datos personales 

7.1. Unique 1 Global procesa sus datos personales para varios propósitos legítimos y necesarios para garantizar la entrega efectiva de nuestros Servicios, mantener la seguridad de la Plataforma y cumplir con los requisitos legales y regulatorios aplicables. Las razones específicas para usar sus datos personales incluyen: 

para ofrecer los servicios principales de la Plataforma; 
para personalizar su experiencia de usuario adaptando contenido, recomendaciones y Servicios según sus preferencias de uso y actividades de trading; 
para cumplir con las regulaciones aplicables, incluyendo los requisitos de AML y KYC, y otras obligaciones legales que ayudan a prevenir el fraude y asegurar la seguridad de las transacciones; 
para realizar procesos de verificación de identidad y llevar a cabo las comprobaciones necesarias para cumplir con los requisitos regulatorios y legales; 
para procesar sus transacciones, incluyendo depósitos, retiros y ejecuciones de operaciones, y gestionar su cuenta para asegurar su correcto funcionamiento; 
para proporcionarle el historial de transacciones, informes y actualizaciones sobre el estado de su cuenta, incluyendo saldos y cualquier cambio relevante; 
para monitorear y detectar accesos no autorizados o actividades fraudulentas en la Plataforma y asegurar la seguridad y protección de su cuenta e información personal; 
para proteger contra violaciones de datos, amenazas cibernéticas y otros riesgos para la integridad de la Plataforma; 
para comunicarnos con usted sobre información importante relacionada con su cuenta, como actualizaciones, mantenimiento del sistema o cambios en el servicio; 
para responder a sus consultas, proporcionar soporte al cliente y ayudarle a resolver cualquier problema que pueda encontrar al usar nuestra Plataforma; 
con su consentimiento, para enviarle ofertas promocionales, boletines informativos u otras comunicaciones de marketing sobre productos, servicios o características que creemos pueden ser de su interés; 
para analizar sus preferencias y comportamiento y ofrecer contenido de marketing más relevante y mejorar nuestras estrategias promocionales; 
para cumplir con nuestras obligaciones contractuales con usted; 
para resolver disputas o reclamaciones y para la defensa de derechos legales, en caso de ser necesario. 
7.2. Al recopilar y procesar sus datos personales para estos fines, garantizamos que Unique 1 Global pueda ofrecerle una experiencia segura, conforme a la normativa y fácil de usar, al mismo tiempo que cumple con las leyes de protección de datos pertinentes. 

 

8. Base legal para el tratamiento de datos personales 

8.1. En Unique 1 Global, procesamos sus datos personales de acuerdo con las leyes de protección de datos aplicables. Nos aseguramos de que todas las actividades de procesamiento de datos se basen en uno o más de los siguientes fundamentos legales: 

8.1.1. Cuando nos proporcione su consentimiento explícito. En ciertos casos, podemos solicitar su consentimiento explícito para procesar sus datos personales. Esto puede incluir comunicaciones de marketing, suscripciones a boletines informativos o compartir sus preferencias para servicios personalizados. Puede retirar su consentimiento en cualquier momento contactándonos (ver Sección 18 de esta Política) o utilizando las opciones de exclusión proporcionadas. 

8.1.12. Para cumplir con nuestras obligaciones contractuales con usted. Procesamos sus datos personales cuando es necesario para el cumplimiento de un contrato con usted o para tomar medidas a su solicitud antes de celebrar un contrato. Esto incluye proporcionarle acceso a nuestros Servicios, procesar sus operaciones, gestionar su cuenta y ejecutar transacciones financieras. 

8.1.3. Cumplir con los requisitos legales y regulatorios. Esto incluye la recopilación de datos para verificaciones KYC, cumplimiento de AML y otras obligaciones regulatorias. También se aplica a las obligaciones de mantenimiento de registros. 

8.1.4. Para perseguir nuestros intereses comerciales legítimos. Podemos procesar sus datos para fines que estén en nuestros intereses legítimos, siempre que estos intereses no sean anulados por sus derechos de privacidad. Esto incluye, pero no se limita a: mejorar la seguridad de la Plataforma, prevenir el fraude o el uso indebido de nuestros Servicios, mejorar nuestros Servicios y desarrollar nuevas funciones para servir mejor a nuestros usuarios, analizar el uso de la Plataforma para ofrecer una experiencia más personalizada y mejorar la participación de los usuarios. 

8.1.5. Para proteger intereses vitales. En situaciones raras, podemos procesar sus datos personales para proteger sus intereses vitales o los intereses vitales de otra persona. Por ejemplo, en una situación de emergencia donde se requiera datos personales para proteger la vida o prevenir daños. 

8.1.6. En interés público o en el ejercicio de la autoridad oficial. En ciertos casos, podemos procesar sus datos personales cuando sea necesario para el desempeño de una tarea realizada en interés público o en el ejercicio de la autoridad oficial que se nos ha conferido. 

8.2. Además de las categorías generales de datos personales mencionadas anteriormente, también podemos procesar categorías de datos sensibles o especiales, como información financiera y documentos de identificación, cuando sea necesario para cumplir con requisitos legales o regulatorios, incluidos los fines de KYC y AML. Solo procesaremos datos sensibles basándonos en su consentimiento explícito o de acuerdo con las obligaciones legales que nos exigen hacerlo. 

8.3. A continuación, describimos las diversas formas en que pretendemos utilizar sus datos, especificando las bases legales en las que nos basamos para cada propósito. Cuando sea aplicable, también hemos identificado nuestros intereses legítimos. Tenga en cuenta que, dependiendo del propósito específico, podemos procesar sus datos bajo más de una base legal. 



Propósito/Actividad	Tipo de datos	Base legal

Para crear una cuenta de usuario	•	Datos de identidad 

	•	Datos de contacto 

	•	Datos técnicos	Ejecución de un contrato cuando proporcionamos nuestros Servicios

Para verificar la identidad del usuario, realizar las comprobaciones que estamos obligados a llevar a cabo según las leyes y regulaciones aplicables (KYC, AML, fraude, sanciones, personas políticamente expuestas y verificación de vida) y realizar la categorización del riesgo del cliente	•	Datos de identidad 

	•	Datos de contacto 

	•	Datos de evaluación 

	•	Datos de transacciones 

	•	Datos de evaluación de riesgos 

	•	Datos técnicos 

	•	Datos de comunicación 

	•	Datos financieros 

	•	Datos de uso	Cumplimiento de las obligaciones legales bajo las leyes y regulaciones aplicables

Para obtener y evaluar la información del perfil económico y la idoneidad, categoriza al usuario	•	Datos económicos y sobre la pertinencia	Cumplimiento de las obligaciones legales bajo las leyes y regulaciones aplicables

Para proporcionar nuestros Servicios y procesar transacciones, incluidos pagos, tarifas y cargos	•	Datos de identidad 

	•	Datos de contacto 

	•	Datos financieros 

	•	Datos de transacciones 

	•	Datos técnicos 

	•	Datos de perfil	Ejecución de un contrato cuando proporcionamos nuestros Servicios

Para monitorear las transacciones con el propósito de detectar, almacenar e informar sobre actividades fraudulentas	•	Datos de identidad 

	•	Datos de contacto 

	•	Datos de evaluación 

	•	Datos de evaluación de riesgos 

	•	Datos financieros 

	•	Datos de transacciones 

	•	Datos técnicos 

	•	Datos de uso	Cumplimiento de las obligaciones legales bajo las leyes y regulaciones aplicables

Para proporcionar soporte al cliente	•	Datos de identidad 

	•	Datos de contacto 

	•	Datos de transacciones 

	•	Datos técnicos	Ejecución de un contrato cuando proporcionamos nuestros Servicios

Para enviar notificaciones de servicio relacionadas con su uso de los Servicios	•	Datos de contacto 

	•	Datos de comunicación	Ejecución de un contrato cuando proporcionamos nuestros Servicios

Para registrar y almacenar la comunicación con usted	•	Datos de identidad 

	•	Datos de contacto 

	•	Datos de comunicación	Cumplimiento de las obligaciones legales bajo las leyes y regulaciones aplicables

Para enviar actualizaciones y comunicaciones de marketing, así como para entregar contenido relevante a los usuarios, incluyendo anuncios, sugerencias, ofertas personalizadas y recomendaciones	•	Datos de identidad 

	•	Datos de contacto 

	•	Datos financieros 

	•	Datos de transacciones 

	•	Datos técnicos 

	•	Datos de perfil 

	•	Datos de uso	Consentimiento, o nuestros intereses legítimos para promover nuestros Servicios

Realizar análisis de datos con respecto a nuestros Servicios con fines de mejora	•	Datos técnicos 

	•	Datos de uso	Nuestros intereses legítimos para mejorar nuestros Servicios

Para gestionar y proteger nuestro negocio y Plataforma, incluyendo el mantenimiento del sistema	•	Datos de identidad 

	•	Datos técnicos 

	•	Datos de uso	Nuestros intereses legítimos para mejorar nuestros Servicios; ejecución de un contrato cuando proporcionamos nuestros Servicios

Para ayudarnos a mejorar nuestros Servicios completando una encuesta, comentarios o reseñas	•	Datos de identidad 

	•	Datos de perfil	Consentimiento

8.4. La falta de proporcionar la información personal necesaria puede resultar en la imposibilidad de acceder o utilizar nuestros Servicios. Ciertos datos personales son esenciales para que podamos ofrecerle nuestros Servicios y garantizar el cumplimiento de las obligaciones legales aplicables. Sin esta información, podríamos estar legalmente prohibidos de procesar sus transacciones, verificar su identidad o cumplir con otras obligaciones bajo las leyes aplicables. Por lo tanto, es crucial que proporcione datos personales precisos y completos para poder acceder plenamente a las características y beneficios de los Servicios que ofrecemos. En los casos en que no se proporcione dicha información, podemos suspender o limitar su acceso a nuestra Plataforma hasta que se obtenga y verifique la información necesaria. 

 

9. Compartición y divulgación de datos personales 

9.1. En Unique 1 Global, entendemos la importancia de proteger sus datos personales. Sin embargo, en ciertas circunstancias, podemos compartir o divulgar sus datos personales de acuerdo con esta Política. A continuación se detallan las circunstancias bajo las cuales podemos compartir su información personal: 

con otras empresas dentro del grupo Unique One Global Ltd para fines operativos, incluyendo la provisión, mantenimiento y mejora de nuestros Servicios; 
con proveedores de terceros que ofrecen Servicios o productos integrados con nuestra Plataforma, como proveedores de sistemas de comunicación, plataformas de trading que son esenciales para su experiencia de usuario. Estos proveedores externos están obligados a cumplir con los estándares de privacidad y solo utilizarán sus datos personales según sea necesario para proporcionar sus servicios a nosotros; 
a proveedores de servicios contratados y asesores que nos asisten en diversas operaciones comerciales, incluyendo pero no limitado a: servicios de TI (por ejemplo, alojamiento, soporte técnico y mantenimiento de infraestructura), proveedores de análisis; agencias de marketing; consultores financieros, regulatorios y de cumplimiento. Estas entidades están obligadas a cumplir con los acuerdos de protección de datos y tienen prohibido usar sus datos personales para cualquier propósito distinto al que fueron proporcionados; 
con corredores de introducción y afiliados que tienen relaciones mutuas con nosotros; 
con proveedores de servicios de pago y bancos para procesar depósitos, retiros y otras transacciones financieras; 
con auditores y contratistas que nos asisten en la auditoría de nuestras operaciones, brindando asesoría empresarial o realizando actividades relacionadas con la gestión empresarial; 
con autoridades legales y regulatorias, incluidos tribunales, juzgados, organismos gubernamentales y agencias de aplicación de la ley, cuando lo exija la ley o lo autoricen acuerdos legales. Esto podría ocurrir en respuesta a una solicitud legal de información o en el contexto de una investigación legal en curso; 
con terceros cuando sea necesario para hacer cumplir nuestros términos y condiciones de servicio; 
a cualquier entidad autorizada por usted, incluidos terceros a los que haya permitido explícitamente recibir su información para fines específicos. 
9.2. Unique 1 Global asegura que cualquier tercero con el que compartamos sus datos personales esté obligado a manejarlos con el máximo cuidado y en plena conformidad con las leyes de protección de datos aplicables. Estos terceros están obligados por estrictas obligaciones contractuales a utilizar los datos únicamente para los fines específicos para los cuales fueron proporcionados, asegurar la seguridad de sus datos personales, mantener la confidencialidad y prevenir que los datos sean divulgados a partes no autorizadas, cumplir con las leyes y regulaciones de protección de datos aplicables, incluyendo asegurar que los datos sean procesados de manera legal, justa y transparente. Si alguno de nuestros proveedores de servicios no cumple con estos estándares, tomamos las medidas adecuadas para remediar la situación y garantizar la continua protección de su información personal. 

9.3. Además, nuestra Plataforma puede contener enlaces externos a sitios web de terceros. Tenga en cuenta que estos sitios externos no están cubiertos por esta Política. Recomendamos que revise las políticas de privacidad de cualquier sitio web de terceros que visite, ya que no somos responsables de sus prácticas de datos. 

 

10. Transferencias internacionales 

10.1. Para los datos originarios de países de EEE, tomamos medidas específicas para garantizar el cumplimiento de las regulaciones y leyes regionales, particularmente en lo que respecta a las transferencias de datos transfronterizas. Por ejemplo, en Brasil, cumplimos con los requisitos de la Lei Geral de Proteção de Dados (LGPD), que regula la protección de datos y la privacidad en el país. 

10.2. Para garantizar el cumplimiento legal de las transferencias de datos transfronterizas, empleamos varios mecanismos, tales como: 

Cláusulas Contractuales Tipo (CCT), son acuerdos contractuales reconocidos legalmente que rigen la transferencia de datos personales entre entidades ubicadas en diferentes países, asegurando que se implementen medidas adecuadas de protección para sus datos. Puede solicitar detalles de estos arreglos contactándonos a través de los datos de contacto proporcionados en la Sección 18 de esta Política. 
Consentimiento explícito del usuario, en los casos donde las transferencias de datos transfronterizas requieran un consentimiento adicional del usuario, nos aseguramos de que los usuarios sean informados y proporcionen un consentimiento claro y sin ambigüedades antes de que se realice cualquier transferencia de datos personales. 
10.3. Estas medidas nos ayudan a garantizar que los datos transferidos fuera de las jurisdicciones de EEE permanezcan seguros y que cumplamos con las leyes locales de protección de datos, al mismo tiempo que mantenemos los más altos estándares de privacidad de datos y protección del usuario. 

 

11. Retención de datos personales 

11.1. Unique 1 Global se compromete a retener sus datos personales solo durante el tiempo necesario para cumplir con los fines específicos para los cuales fueron recopilados, de acuerdo con las leyes y regulaciones aplicables. Los períodos de retención pueden variar dependiendo de la naturaleza de los datos y los requisitos regulatorios que se apliquen a ellos. 

11.2. En cumplimiento con las regulaciones locales en los países de la región EEE, observamos las siguientes prácticas de retención de datos: 

De acuerdo con las regulaciones brasileñas contra el lavado de dinero, retenemos los datos durante un mínimo de 5 años después del final de la relación comercial. 
Para cumplir con las leyes fiscales mexicanas, la información relacionada con impuestos se retiene por un mínimo de 6 años con fines contables. 
11.3. En ciertas situaciones, las autoridades pueden requerir que retengamos datos personales por períodos más largos, especialmente cuando se necesitan datos para investigaciones en curso o procedimientos legales. En tales casos, cumpliremos con cualquier instrucción legal emitida por las autoridades competentes. 

11.4. Cuando los datos ya no sean necesarios para fines comerciales o legales, los haremos anónimos o eliminaremos de forma segura para prevenir el acceso o uso no autorizado. 

11.5. Si no ha utilizado activamente nuestros servicios financieros durante un período de 5 a 6 años (dependiendo del tipo de datos), eliminaremos de forma segura o anonimizar cualquier dato personal que pueda identificarle, a menos que podamos justificar una razón legítima para retener los datos por un período más largo. 

11.6. Si una solicitud de cuenta está incompleta o es rechazada, retendremos los datos por un período de 6 meses, a menos que los requisitos regulatorios aplicables dicten un período de retención más largo. 

11.7. Al expirar el período de retención de datos, nos aseguramos de que sus datos personales sean eliminados de manera irrevocable mediante métodos de destrucción segura. Además, notificaremos a cualquier tercero al que se hayan transferido sus datos sobre la eliminación y solicitaremos que implementen acciones similares para destruir o anonimizar de manera segura los datos que poseen. 

 

12. Derechos del usuario 

12.1. Como usuario, tiene varios derechos bajo las leyes de protección de datos en relación con los datos personales que recopilamos, procesamos y almacenamos. Aunque estos derechos pueden no aplicarse en todas las situaciones, tiene derecho a solicitar lo siguiente: 

Solicitud de acceso. Tiene derecho a solicitar confirmación de si sus datos personales están siendo procesados por nosotros. También puede solicitar detalles adicionales sobre los datos que poseemos, los fines del procesamiento y las categorías de datos involucradas. Bajo ciertas condiciones, también puede solicitar una copia de los datos personales que tenemos sobre usted. 
Solicitud de corrección. Si los datos personales que tenemos sobre usted son inexactos o incompletos, tiene derecho a solicitar que los corrijamos o actualicemos. Esto asegura que los datos que procesamos permanezcan precisos y relevantes para los fines para los cuales fueron recopilados. 
Solicitud de eliminación. Tiene el derecho de solicitar la eliminación de sus datos personales cuando ya no sean necesarios para los fines para los cuales fueron recopilados, o cuando retire su consentimiento (si el consentimiento es la base para el procesamiento). Sin embargo, este derecho puede estar sujeto a limitaciones, como cuando los datos son necesarios para obligaciones legales o reclamaciones legales en curso. 
Objeción al procesamiento. Tiene el derecho a oponerse al tratamiento de sus datos personales cuando el tratamiento se base en nuestros intereses legítimos. Si se opone al tratamiento de sus datos, dejaremos de procesarlos a menos que podamos demostrar motivos legítimos imperiosos que anulen sus derechos o que los datos sean necesarios para el establecimiento, ejercicio o defensa de reclamaciones legales. 
Solicitud de restricción del procesamiento. Puede solicitar una restricción en el procesamiento de sus datos personales en circunstancias específicas, tales como: si cree que los datos que poseemos son inexactos y necesitan ser verificados; si se opone al procesamiento pero desea restringirlo mientras verificamos los motivos del procesamiento. 
Solicitud de transferencia de datos. Tiene derecho a solicitar la transferencia de sus datos personales a usted o a un tercero en un formato estructurado, de uso común y legible por máquina. Este derecho se aplica cuando el tratamiento se basa en su consentimiento o en un contrato y se lleva a cabo por medios automatizados. 
Optar por no recibir comunicaciones de marketing. Si no desea recibir comunicaciones de marketing ni que sus datos se compartan con terceros con fines comerciales, puede configurar sus preferencias de las siguientes maneras: durante la creación de su cuenta o en la sección de configuración de notificaciones de su perfil; al recibir contenido de marketing, puede hacer clic en el enlace para darse de baja incluido en la comunicación; también puede enviarnos un correo electrónico a support@uniqueoneglobal.com en cualquier momento para dejar de recibir comunicaciones comerciales. 
Derecho a retirar el consentimiento. Si la base legal para el procesamiento de sus datos es su consentimiento, tiene el derecho de retirar ese consentimiento en cualquier momento. Retirar el consentimiento no afectará la legalidad del procesamiento basado en el consentimiento previo a su retiro. Una vez que se retire el consentimiento, dejaremos de procesar sus datos a menos que el procesamiento continuo sea requerido o permitido por la ley. 
Derecho a presentar una queja. Si no está satisfecho con la forma en que manejamos sus datos, o con la información que ha recibido, tiene el derecho de presentar una queja ante la autoridad de supervisión de protección de datos correspondiente. Le invitamos a que nos contacte primero para que podamos abordar cualquier inquietud y mejorar nuestras prácticas. 
12.2. Para ejercer cualquiera de los derechos mencionados anteriormente, por favor envíe su solicitud por correo electrónico a support@uniqueoneglobal.com utilizando la dirección de correo electrónico registrada asociada a su cuenta. En algunos casos, podemos solicitar información adicional para verificar su identidad. 

12.3. Nuestro objetivo es responder a sus solicitudes de datos dentro de los 7 días hábiles. Sin embargo, si su solicitud es particularmente compleja o involucra múltiples solicitudes, puede tardar más. En tales casos, le notificaremos del retraso y le mantendremos informado sobre el progreso. 

12.4. Aunque nuestro objetivo es manejar todas las solicitudes de forma gratuita, podemos cobrar una tarifa administrativa razonable por solicitudes que sean manifiestamente infundadas, excesivas o repetitivas. Le notificaremos de cualquier tarifa aplicable antes de procesar su solicitud. 

12.5. Usted, como usuario de países de la región de EEE, puede tener derechos adicionales bajo las leyes locales de protección de datos: 

En Brasil, tiene el derecho de confirmar si sus datos están siendo procesados, solicitar la anonimización y buscar una explicación de los procesos de toma de decisiones automatizadas. 
 

13. Cookies 

13.1. Las cookies se utilizan comúnmente para mejorar la experiencia del usuario recordando sus preferencias, habilitando ciertas funcionalidades y analizando el tráfico del sitio web. Unique 1 Global utiliza diferentes tipos de cookies para mejorar su experiencia en nuestra Plataforma. 

13.2. Para una comprensión detallada de cómo usamos las cookies, cuánto tiempo las retenemos y cómo puedes gestionarlas o bloquearlas, por favor consulta nuestra Política de Cookies. La Política de Cookies proporciona información completa sobre los diversos propósitos para los cuales se utilizan las cookies, información sobre cómo puede ajustar la configuración de su navegador para gestionar o bloquear las cookies, detalles sobre las cookies establecidas por proveedores de servicios de terceros, etc. 

 

14. Datos personales de menores 

14.1. En Unique 1 Global, estamos comprometidos con proteger la privacidad y la seguridad de los niños. Nuestros Servicios no están destinados a personas menores de 18 años, y no recopilamos ni procesamos intencionadamente datos personales de niños. Al utilizar nuestra Plataforma, confirma que cumple con este requisito de edad. 

14.2. Si nos damos cuenta de que hemos recopilado inadvertidamente datos personales de un niño, tomaremos medidas inmediatas para eliminar esos datos de nuestros sistemas. Si cree que hemos recopilado datos de un menor, comuníquese con nosotros a support@uniqueoneglobal.com y tomaremos las medidas necesarias de inmediato. 

 

15. Medidas de seguridad 

15.1. La seguridad y confidencialidad de sus datos personales son de suma importancia para nosotros. Hemos implementado medidas de seguridad robustas para prevenir el acceso no autorizado, la pérdida, el uso indebido, la alteración o la divulgación de su información personal. Nuestro marco de seguridad sigue las mejores prácticas de la industria y cumple con las leyes de protección de datos aplicables para garantizar el más alto nivel de protección de sus datos. 

15.2. Empleamos estrictas medidas de control de acceso para garantizar que los datos personales solo sean accesibles para empleados, agentes, contratistas y terceros que tengan una necesidad legítima de conocerlos. Estas personas y entidades están obligadas a procesar sus datos de acuerdo con nuestras instrucciones y están sujetas a estrictos acuerdos de confidencialidad. El acceso a los datos personales se concede según la necesidad de conocer, asegurando que solo el personal autorizado pueda acceder a sus datos, y solo para los fines necesarios para proporcionarle nuestros Servicios. 

15.3. Utilizamos tecnologías de cifrado para garantizar la transmisión segura de sus datos personales. Cuando ingresas tu información personal en nuestra Plataforma, aplicamos cifrado para proteger tus datos durante el tránsito desde tu dispositivo hasta nuestros servidores. 

15.4. Todos los datos relacionados con su información personal se procesan y almacenan en centros de datos seguros y dedicados. Estas instalaciones están protegidas por medidas de seguridad de última generación, y el acceso a la red de este equipo está estrictamente aislado de internet. 

15.5. Nos mantenemos atentos a la identificación y mitigación de las amenazas modernas a la seguridad de los datos. Nuestra infraestructura es monitoreada continuamente, y todos los eventos son analizados en tiempo real para detectar vulnerabilidades, malware o intentos de acceso no autorizado. Nuestro equipo de respuesta de seguridad está capacitado para manejar incidentes de manera rápida, asegurando que sus datos permanezcan protegidos en todo momento. En caso de un problema de accesibilidad de datos, hemos establecido procedimientos de respaldo y recuperación de datos para restaurar la información rápidamente y minimizar el tiempo de inactividad. Nuestras bases de datos críticas operan en modo de alta disponibilidad, asegurando una mínima interrupción de sus servicios. 

15.6. Los empleados que manejan sus datos reciben capacitación regularmente sobre prácticas de seguridad de datos y requisitos de confidencialidad. El acceso a sus datos personales está estrictamente limitado según el rol y las responsabilidades del empleado, asegurando que solo aquellos que necesiten acceso para desempeñar sus funciones obtengan permiso. Monitoreamos todas las acciones de los empleados que involucran datos personales, asegurándonos de que cumplan con nuestros protocolos de seguridad. Además, realizamos capacitaciones regulares para mantener a nuestro personal actualizado sobre los últimos principios de protección de datos y prácticas de seguridad. 

15.7. Cuando se registre en Unique 1 Global, se le pedirá que elija un nombre de usuario y una contraseña para acceder a su cuenta de Unique 1 Global y realizar transacciones. Para proteger su cuenta y datos, es esencial que no comparta sus credenciales de inicio de sesión con terceros. Usted es el único responsable de la seguridad y el uso de su cuenta, y no somos responsables de ningún daño o pérdida causada por el uso indebido o la compartición de su información de inicio de sesión. En caso de que sospeche de un acceso no autorizado a su cuenta, por favor notifíquenos de inmediato a support@uniqueoneglobal.com. Tomaremos las medidas necesarias para abordar la situación y asegurar su cuenta. 

15.8. En el transcurso de nuestra relación comercial con usted, generalmente no participamos en la toma de decisiones automatizada. Sin embargo, en algunos casos, podemos utilizar la elaboración de perfiles para evaluar ciertos aspectos personales suyos, como su comportamiento de trading o perfil de riesgo, con el fin de ofrecer servicios más personalizados o mejorar nuestras ofertas. En caso de que utilicemos la toma de decisiones automatizada o el perfilado en alguna instancia específica, le informaremos y buscaremos su consentimiento cuando sea necesario. 

15.9. Unique 1 Global retiene sus datos personales durante el tiempo necesario para proporcionar servicios, cumplir con las obligaciones legales y proteger nuestros intereses legítimos. Cuando los datos ya no sean necesarios para estos fines, se eliminarán de forma segura o se harán anónimos para prevenir el acceso no autorizado. 

 

16. Disposiciones varias 

16.1. Notificación de violación de los sistemas de seguridad. En el improbable caso de una violación de seguridad en nuestros sistemas, Unique 1 Global se compromete a hacer todo lo posible para notificar a las partes afectadas con la mayor prontitud posible. Tomaremos medidas inmediatas para informar a los usuarios de cualquier incidente de seguridad significativo y podemos publicar un aviso oficial en nuestra Plataforma para garantizar la transparencia. Esta notificación incluirá detalles de la brecha, las posibles consecuencias y las medidas que se están tomando para mitigar cualquier riesgo adicional. También proporcionaremos orientación sobre cómo los usuarios afectados pueden protegerse a la luz de la brecha. 

16.2. Cambios en el negocio y transferencia de datos. En caso de cambios significativos en el negocio, como una fusión, adquisición o cambio de control, Unique 1 Global se reserva el derecho de transferir la información del usuario como parte del proceso de transición. Los usuarios serán informados con antelación de cualquier transferencia de datos que ocurra durante tales eventos. En situaciones de quiebra, liquidación o circunstancias empresariales similares, el control sobre la información personal puede estar sujeto a cambios, y nos aseguraremos de que se implementen salvaguardias adecuadas para proteger los datos de los usuarios durante tales transiciones. 

 

17. Cambios a esta Política 

17.1. Unique 1 Global se reserva el derecho de actualizar o modificar esta Política periódicamente en respuesta a cambios en las regulaciones, nuestros Servicios o prácticas comerciales. Cuando realicemos actualizaciones, revisaremos la fecha de vigencia en la parte superior de esta Política. 

17.2. Le notificaremos de cualquier cambio material en esta Política por correo electrónico u otros métodos de comunicación según corresponda. Si hacemos actualizaciones significativas, también podemos publicar un aviso en nuestra Plataforma para asegurarnos de que esté al tanto de los cambios. Es importante revisar esta Política periódicamente para mantenerse informado sobre cómo estamos protegiendo sus datos personales. 

 

18. Información de contacto 

Unique 1 Global es el responsable del tratamiento de los datos, encargado de la recopilación, el procesamiento y el almacenamiento de sus datos personales, según lo establecido en esta Política. Para cualquier pregunta, inquietud o solicitud relacionada con el procesamiento de sus datos personales, incluyendo el ejercicio de sus derechos bajo las leyes de protección de datos aplicables, por favor contáctenos: 

Teléfono: +371 254 93 902 
Email: support@uniqueoneglobal.com 
Dirección operativa: 2134203 en Virgin Islands (British). La oficina registrada se encuentra en Clarence Thomas Building, P.O. Box 4649, Road Town, Tortola. 
Estamos comprometidos a atender sus consultas y a garantizar que se respeten sus derechos. 

________________________________________________________________________________________________________________________________________________________________ 

 

Condiciones Generales  

 

Términos y Condiciones 

Última actualización: 1 de agosto de 2025 

Versión: 1.1 

 

1. Introducción 

1.1. Unique 1 Global es una plataforma digital de comercio integral gestionada por Unique One Global Ltd, una empresa registrada como Compañía de Negocios Internacionales (IBC, por sus siglas en inglés) en Saint Lucia, bajo el número de empresa 3882-499234, con la oficina registrada ubicada 2134203 en Virgin Islands (British). La oficina registrada se encuentra en Clarence Thomas Building, P.O. Box 4649, Road Town, Tortola. (en adelante - “nosotros”,“nuestro”,“nos” o “Unique 1 Global”) 

1.2. La plataforma Unique 1 Global opera tanto a través de un sitio web, disponible en https://uniqueoneglobal.com, como en una aplicación móvil (en adelante, “Plataforma” o “Unique 1 Global”). Esta Plataforma permite a los usuarios participar en actividades de trading, incluyendo Contratos por Diferencia (CFDs) sobre varios valores, instrumentos derivados, copy trading e inversión en carteras diversificadas, y les proporciona otros servicios que están completamente descritos en estos Términos y Condiciones (en adelante, “Servicios”). Como parte de nuestro compromiso de proporcionar un entorno robusto y seguro, Unique 1 Global ofrece herramientas y características que permiten a los usuarios tomar decisiones informadas en su trayectoria de trading. 

1.3. La Plataforma ha sido diseñada para operar en estricta conformidad con todos los marcos legales y regulatorios aplicables, asegurando que todas las interacciones se manejen de acuerdo con las leyes locales e internacionales aplicables. 

1.4. Estos Términos y Condiciones rigen el uso de los Servicios proporcionados por Unique 1 Global. Al acceder o utilizar nuestra Plataforma, incluyendo nuestro sitio web y aplicación móvil, los usuarios aceptan explícitamente cumplir con los términos establecidos en este documento. 

1.5. Su uso continuo de los Servicios implica la aceptación de estos Términos y Condiciones, incluyendo cualquier enmienda o actualización realizada de vez en cuando. Recomendamos que revise regularmente este documento en nuestra Plataforma para mantenerse informado de cualquier cambio. Es su responsabilidad asegurarse de estar al tanto de los términos actuales y de cualquier revisión que pueda ocurrir. 

1.6. Unique 1 Global se compromete a garantizar que nuestros Servicios cumplan con los marcos regulatorios aplicables y los estándares de protección al consumidor en las jurisdicciones de operación. Si bien estos Términos y Condiciones describen nuestras operaciones estándar, nos esforzamos continuamente por adaptarnos a los requisitos legales y de cumplimiento en evolución de acuerdo con las jurisdicciones de operación. 

En línea con esta declaración, nuestro objetivo es: 

cumplir con las regulaciones en las jurisdicciones de operación. Nos aseguramos de que nuestros Servicios operen en cumplimiento con las leyes y regulaciones que rigen los servicios financieros, el comercio y la protección al consumidor en los países de la región EEE. 
proporcionar información clara y accesible. Nos aseguramos de que toda la información relevante, incluidos los honorarios, cargos y riesgos, se presente en los idiomas locales donde sea necesario, para que los usuarios en los mercados de EEE puedan comprender plenamente sus derechos y obligaciones. 
participar en prácticas responsables. Seguimos las mejores prácticas de la industria que se alinean con las expectativas regulatorias en los mercados de EEE, asegurando que nuestros servicios se proporcionen con integridad, transparencia y responsabilidad. 
 

Al aceptar y utilizar nuestros Servicios, usted reconoce que ha leído, entendido y aceptado estar sujeto a estos Términos y Condiciones, así como a cualquier otra política que rija su uso de nuestra Plataforma. 

1.7. Podemos actualizar periódicamente estos Términos y Condiciones para reflejar cambios en nuestros Servicios, operaciones o requisitos regulatorios. La versión más reciente, disponible en nuestra Plataforma, regirá el uso de nuestros Servicios y reemplazará cualquier versión anterior. Le recomendamos que revise estos Términos y Condiciones regularmente para mantenerse informado sobre los derechos, responsabilidades y obligaciones que se aplican al usar nuestra Plataforma. En caso de que haya cambios o adiciones materiales a estos Términos y Condiciones, le notificaremos por correo electrónico o mediante un aviso destacado en nuestra Plataforma. Cuando la ley lo exija, solicitaremos su consentimiento o le ofreceremos una oportunidad de exclusión para cualquier nuevo término o condición. Al continuar utilizando nuestros Servicios después de cualquier actualización o cambio en estos Términos y Condiciones, usted reconoce que ha revisado y acepta los términos expuestos. 

1.8. Es importante que revise estos Términos y Condiciones junto con cualquier otra política o documento disponible en Unique 1 Global, para asegurarse de estar completamente informado sobre los derechos y obligaciones que se aplican a su uso de nuestros Servicios. Estos documentos explican colectivamente las reglas, responsabilidades y protecciones establecidas para su uso de la Plataforma. 

 

2. Definiciones 

"Ley Aplicable" se refiere a las leyes, regulaciones y requisitos legales que rigen los Servicios de Unique 1 Global en las jurisdicciones donde se ofrecen. Esto incluye, pero no se limita a, las regulaciones financieras locales, las leyes de protección al consumidor y las políticas fiscales específicas de la región EEE y de cualquier otro país donde Unique 1 Global opere. Los usuarios reconocen que Unique 1 Global cumplirá con los estándares legales pertinentes en los países en los que opera, incluyendo aquellos que rigen las actividades comerciales, la lucha contra el lavado de dinero y las leyes de financiamiento del terrorismo. La Ley Aplicable también abarca cualquier tratado o acuerdo internacional que impacte las operaciones de Unique 1 Global. 

"Prevención del Lavado de Dinero" (en adelante, "PLD") se refiere a leyes, regulaciones y procedimientos diseñados para prevenir el uso ilegal del sistema financiero para actividades de lavado de dinero. 

“Financiamiento del Terrorismo” (en adelante, “FT”) se refiere a regulaciones y acciones destinadas a prevenir el apoyo financiero al terrorismo y actividades relacionadas. 

“Copy Trading”, una función dentro de Unique 1 Global que permite a los usuarios replicar automáticamente las estrategias de trading de traders experimentados seleccionados, permitiendo a los usuarios imitar sus operaciones. 

"Fuerza Mayor" se refiere a eventos fuera del control de Unique 1 Global que impiden o retrasan el cumplimiento de sus obligaciones bajo estos Términos y Condiciones, tales como desastres naturales, fallos técnicos, acciones gubernamentales o pandemias. 

"Conozca a su Cliente" (en adelante - "KYC", por sus siglas en inglés), un proceso utilizado por Unique 1 Global para verificar la identidad de sus usuarios y asegurar el cumplimiento de las regulaciones de AML y CTF. 

"Apalancamiento", una característica financiera que permite a los usuarios controlar posiciones más grandes en el mercado utilizando una cantidad relativamente menor de capital inicial. Este proceso implica pedir prestados fondos, generalmente de la plataforma o un bróker, para aumentar el tamaño de la inversión. 

“Unique 1 Global AI Assistant”, una herramienta avanzada impulsada por IA desarrollada por Unique 1 Global que ayuda a los usuarios a seleccionar traders a seguir según su perfil financiero único. La IA aprende y se adapta continuamente al comportamiento de trading del usuario, asegurando que las recomendaciones se mantengan alineadas con las preferencias y objetivos cambiantes del usuario. 

“Unique 1 Global AI Index”, un portafolio impulsado por IA creado y optimizado por Unique 1 Global que ejecuta automáticamente operaciones basadas en las estrategias de los traders de mejor rendimiento en la Plataforma. 

“cuenta Unique 1 Global”, la cuenta de usuario creada por un individuo o entidad en la Plataforma, necesaria para acceder y utilizar los Servicios. 

"aplicación Android de Unique 1 Global" se refiere a la aplicación móvil desarrollada por Unique 1 Global para dispositivos Android. Los usuarios pueden acceder a los servicios de trading, monitorear sus cuentas y ejecutar operaciones directamente a través de la aplicación, asegurando una funcionalidad completa mientras están en movimiento. 

" Unique One Global Web" se refiere a la plataforma basada en la web proporcionada por Unique 1 Global para acceder a los servicios de trading. La plataforma permite a los usuarios operar con una variedad de instrumentos financieros, gestionar sus cuentas y utilizar herramientas avanzadas directamente desde cualquier navegador web, sin necesidad de instalar software adicional. 

"MetaQuotes 5" (en adelante, "MT5") se refiere a la plataforma de trading MetaTrader 5, un software altamente avanzado y ampliamente utilizado para operar en los mercados financieros. Desarrollado por MetaQuotes Software, MT5 permite a los usuarios operar con diversos instrumentos como CFDs, forex, acciones, materias primas y criptomonedas. 

“Orden”, la solicitud de un usuario para comprar, vender o negociar un instrumento financiero en la Plataforma, que puede incluir órdenes limitadas, órdenes de stop-loss y órdenes de take-profit. 

"Ejecución de órdenes", el proceso mediante el cual Unique 1 Global lleva a cabo la orden de un usuario para comprar, vender o negociar instrumentos financieros, de acuerdo con las instrucciones del usuario. 

“Servicios”, todos los servicios proporcionados por Unique 1 Global, incluyendo pero no limitado a, el comercio de CFDs, forex, criptomonedas, acciones, materias primas, índices y otros instrumentos financieros, así como el copy trading, las herramientas de IA de Unique 1 Global y otras ofertas relacionadas. 

“Evaluaciones de Idoneidad y Conveniencia”, un proceso mediante el cual Unique 1 Global evalúa si los Servicios de Trading y las características ofrecidas son adecuados para la situación financiera, el conocimiento de inversión y el perfil de riesgo de un usuario. 

“Servicios de Trading”, servicios ofrecidos en la Plataforma que permiten a los usuarios participar en la compra, venta o negociación de instrumentos financieros como CFDs, forex, criptomonedas, commodities e índices. 

"Usuario", "tú", "tu" se refiere a cualquier individuo o entidad que acceda, se registre o use los Servicios de Unique 1 Global. 

"Retiros", el proceso mediante el cual un usuario solicita retirar fondos de su cuenta Unique 1 Global y transferirlos a un método de pago designado. 

 

3. Elegibilidad de los usuarios 

Unique 1 Global proporciona sus servicios exclusivamente a individuos que cumplen con ciertos criterios de elegibilidad. Al acceder o utilizar nuestra Plataforma, confirmas que cumples con las siguientes condiciones: 

3.1. Para utilizar los Servicios ofrecidos por Unique 1 Global, debe tener al menos 18 años o la edad de mayoría de edad en su jurisdicción, lo que sea mayor. Al registrarse para obtener una cuenta y utilizar la Plataforma, declara que cumple con este requisito de edad. Si tiene menos de 18 años, no se le permite usar nuestra Plataforma. 

3.2. Debe tener la capacidad legal para celebrar un contrato vinculante. Al utilizar la Plataforma, confirma que está legalmente autorizado para aceptar y cumplir con estos Términos y Condiciones y cualquier otra política o acuerdo que esté disponible en la Plataforma. 

3.3. Los Servicios de Unique 1 Global están disponibles solo para usuarios en jurisdicciones donde dichos Servicios están legalmente permitidos. No puede utilizar la Plataforma si su país o región prohíbe el uso de servicios de trading o instrumentos financieros, o si se encuentra en una jurisdicción sujeta a sanciones económicas u otras restricciones legales impuestas por las Leyes Aplicables. 

3.4. Para acceder a la gama completa de Servicios en nuestra Plataforma, debe completar el proceso de registro de cuenta, que puede incluir proporcionar su información personal y aceptar estos Términos y Condiciones (ver Sección 5 de estos Términos y Condiciones). Acepta proporcionar información precisa, actual y completa durante el proceso de registro y el uso posterior de la Plataforma, y actualizarla según sea necesario para mantener su precisión. Unique 1 Global se reserva el derecho de rechazar el servicio o cerrar cuentas si no se cumplen los criterios de elegibilidad o si determinamos que un usuario ha proporcionado información falsa o engañosa durante el proceso de registro. 

3.5. Las siguientes personas tienen prohibido usar los Servicios de Unique 1 Global o es probable que estén sujetas a un escrutinio más detallado de acuerdo con nuestra Política AML/KYC: 

Personas Expuestas Políticamente (PEPs), según lo definido por las regulaciones locales, a menos que se tomen los pasos regulatorios necesarios y se cumplan los requisitos de cumplimiento. 
Residentes de países o regiones donde Unique 1 Global tiene prohibido operar, incluyendo países que están sujetos a sanciones internacionales u otras restricciones regulatorias. 
Individuos que han sido prohibidos, excluidos o suspendidos de acceder a los servicios de trading por cualquier autoridad financiera, organismo regulador u organización gubernamental. 
3.6. Usted es responsable de asegurarse de que su uso de los Servicios de Unique 1 Global cumpla con todas las leyes y regulaciones locales aplicables en su país de residencia u operación. Unique 1 Global no proporciona asesoramiento legal sobre las regulaciones comerciales locales ni sobre la legalidad del comercio en jurisdicciones específicas. Al usar la Plataforma, confirma que entiende y acepta cumplir con todos los requisitos legales aplicables. 

 

4. Nuestros Servicios 

4.1. Unique 1 Global proporciona una plataforma de trading digital integral diseñada para ofrecer una amplia gama de Servicios a nuestros usuarios. Nuestra plataforma ofrece características avanzadas de trading, permitiendo a los usuarios participar en diversas oportunidades de inversión, mejorar sus estrategias de trading a través de herramientas innovadoras y disfrutar de opciones flexibles adaptadas a sus objetivos financieros únicos. 

4.2. Los servicios principales disponibles en Unique 1 Global incluyen los siguientes: 

Servicios de Trading. Nuestra plataforma permite a los usuarios operar con una variedad de instrumentos financieros, incluidos CFDs sobre valores, forex, criptomonedas, acciones, materias primas, índices y derivados. Estos servicios están dirigidos tanto a principiantes como a traders experimentados, proporcionando una variedad de herramientas para gestionar el riesgo y maximizar los posibles rendimientos. 
Copy Trading. Unique 1 Global ofrece una función de copy trading, permitiendo a los usuarios replicar automáticamente las operaciones de traders experimentados y hábiles. Esto brinda a los usuarios la oportunidad de aprovechar las estrategias de los mejores traders, mientras mantienen el control sobre parámetros de inversión como el tamaño de las operaciones y los niveles de riesgo. 
Herramientas de Unique 1 Global AI. Nuestro Asistente de IA Unique 1 Global y el Unique 1 Global AI Index, ambos de nuestra propiedad, ofrecen información personalizada basada en datos y estrategias de trading automatizadas. El Asistente de IA conecta a los usuarios con traders que se alinean con sus preferencias de riesgo, objetivos de inversión y estilo de trading. El Unique 1 Global AI Index es un portafolio inteligente que optimiza continuamente las operaciones basándose en las estrategias de los mejores traders dentro de la Plataforma. 
Carteras de Inversión. Ofrecemos a los usuarios la oportunidad de invertir en carteras diversificadas, que consisten en CFDs, valores y otros activos. Estos portafolios están diseñados para proporcionar una exposición equilibrada a diferentes clases de activos, ofreciendo un enfoque de inversión más estable y diversificado. 
4.3. Estos Servicios son accesibles tanto a través de nuestro sitio web como de nuestra aplicación móvil, permitiendo a los usuarios comerciar, invertir y gestionar sus carteras sin problemas, ya sea en dispositivos de escritorio o móviles. 

4.4. Al ofrecer estas herramientas y características, Unique 1 Global empodera a los usuarios para que tomen el control de su viaje financiero, respaldados por tecnología de vanguardia y conocimientos basados en datos. 

 

4.1. Asistente de IA de Unique 1 Global y Unique 1 Global AI Index 

4.1.1. Unique 1 Global ofrece herramientas innovadoras impulsadas por IA diseñadas para mejorar tu experiencia de trading. Estas herramientas, Asistente de IA y Unique 1 Global AI Index, ofrecen estrategias personalizadas y basadas en datos que se adaptan a sus objetivos financieros específicos y preferencias de trading. 

4.1.2. El Asistente de IA de Unique 1 Global es una herramienta poderosa que utiliza inteligencia artificial avanzada para conectarle con traders cuyas estrategias se alinean con su perfil de inversión único. Así es como funciona: 

La IA analiza sus preferencias de riesgo, objetivos de inversión y estilo de trading para seleccionar a los mejores traders cuyas estrategias se adapten mejor a sus necesidades individuales. El Asistente de IA aprende continuamente de sus aportes y adapta las recomendaciones para asegurarse de que esté conectado con el trader adecuado para cumplir sus objetivos. 
Usted tiene la flexibilidad de cambiar de traders en cualquier momento. Si siente que su trader actual no está proporcionando los resultados que desea, puede pausar o dejar de copiarlos y seleccionar un nuevo trader cuya estrategia se alinee mejor con sus objetivos cambiantes o tolerancia al riesgo. 
El Asistente de IA no es estático. A medida que sus preferencias y objetivos cambian, la IA refina continuamente las recomendaciones para servir mejor a sus necesidades, asegurando una experiencia personalizada que se adapta a las condiciones dinámicas del mercado. 
4.1.3. El Unique 1 Global AI Index es un portafolio inteligente impulsado por IA que optimiza automáticamente sus operaciones basándose en el análisis de los traders de mejor rendimiento en la Plataforma. El sistema impulsado por IA prioriza las señales de mejor rendimiento y ejecuta operaciones sin ningún error humano. El Unique 1 Global AI Index evalúa continuamente las operaciones de un amplio grupo de traders, asignando puntuaciones internas y seleccionando las posiciones de mejor rendimiento. 

 

4.2. Servicios de Trading 

4.2.1. Unique 1 Global ofrece un conjunto integral de Servicios de Trading diseñados para atender una amplia gama de preferencias de inversión y perfiles de riesgo. Nuestra plataforma permite a los usuarios operar con una variedad de instrumentos financieros, brindando oportunidades tanto para traders principiantes como experimentados para gestionar y hacer crecer sus carteras de manera efectiva. 

4.2.2. Unique 1 Global le permite invertir en una amplia selección de instrumentos financieros, brindándole la flexibilidad para diversificar su cartera y explorar diversas oportunidades de mercado. Los instrumentos disponibles incluyen: 

Opere Contratos por Diferencia (en adelante, "CFDs") sobre una amplia gama de valores, como acciones y participaciones. Los CFDs le permiten especular sobre los movimientos de precios sin poseer los activos subyacentes, dándole la oportunidad de beneficiarse tanto de los mercados en alza como de los que están en baja. 
Opere con divisas extranjeras en el mercado global de divisas. Esto ofrece un entorno líquido y dinámico para aquellos que buscan operar con pares de divisas y capitalizar las fluctuaciones de los tipos de cambio. 
Acceda a una selección de criptomonedas. Opere activos digitales en un mercado conocido por su alta volatilidad y su significativo potencial de ganancias. 
Compre y venda acciones de empresas que cotizan en bolsa. Esta forma tradicional de comercio ofrece exposición al mercado de valores y el potencial de crecimiento a largo plazo. 
Invierta en materias primas como el oro, el petróleo y los productos agrícolas. Estos instrumentos ofrecen exposición a los mercados globales y pueden servir como una cobertura contra la inflación o la incertidumbre económica. 
Opere en índices bursátiles que siguen el rendimiento de varios sectores o países, ofreciendo un enfoque más diversificado para la exposición al mercado. 
Además de los CFDs, Unique 1 Global le permite operar con otros derivados como futuros y opciones, proporcionando oportunidades adicionales para cubrir riesgos o obtener exposición a una amplia variedad de activos subyacentes. 
Con estos diversos instrumentos de inversión, los usuarios pueden adaptar sus estrategias de trading para cumplir con objetivos de inversión específicos, diversificar sus carteras y aprovechar diferentes condiciones del mercado. 

4.2.3. Nuestra plataforma está diseñada para proporcionar a los usuarios herramientas de trading fáciles de usar, permitiéndoles operar con una amplia gama de instrumentos de manera sencilla. Puede gestionar sus operaciones, monitorear las tendencias del mercado y ajustar su estrategia en tiempo real. Nuestra plataforma admite varios tipos de órdenes y características como stop-loss y take-profit para ayudarle a gestionar el riesgo y maximizar los posibles rendimientos. 

4.2.4. Es importante señalar que operar con estos instrumentos financieros conlleva riesgos inherentes. El valor de sus inversiones puede fluctuar, y existe el potencial tanto de pérdida como de ganancia. Solo debe invertir fondos que pueda permitirse perder y asegurarse de comprender completamente los riesgos involucrados. Unique 1 Global anima a todos los usuarios a realizar una investigación exhaustiva o buscar asesoramiento independiente antes de operar (para obtener información más detallada, consulte nuestra Política de Divulgación de Riesgos). 

4.2.5. Para los usuarios que prefieren un enfoque más práctico o son nuevos en el trading, el copy trading es una excelente opción. Esta función le permite seguir y replicar las operaciones de traders experimentados, dándote la oportunidad de beneficiarse de sus estrategias y conocimientos del mercado. 

Puede ajustar varios parámetros, como la cantidad de su inversión y los niveles de riesgo, para que coincidan con su tolerancia al riesgo y sus objetivos de trading. Esta flexibilidad garantiza que tenga el control total sobre qué tan de cerca su cartera refleja al trader seleccionado. 

Antes de copiar a un trader, puede revisar métricas de rendimiento detalladas para cada trader, incluyendo su rendimiento histórico, niveles de riesgo y estrategias de trading. Estos datos le permiten tomar una decisión informada sobre qué traders se alinean con sus objetivos de inversión. 

Una vez que haya seleccionado un trader para copiar, puede monitorear el desempeño en tiempo real y ajustar sus preferencias si es necesario. Si desea cambiar de traders, puede hacerlo, asegurando el control total sobre su estrategia de inversión. 

 

4.3. Modo de demostración (demo) 

4.3.1. En Unique 1 Global, ofrecemos a los usuarios la opción de activar el modo demo, que incluye $10,000 en fondos de prueba. Esta función le permite practicar el trading y familiarizarse con Unique 1 Global en un entorno en tiempo real, sin ningún riesgo para su capital real. 

4.3.2. Al registrarse, los usuarios pueden optar por activar el modo demo dentro de su cuenta Unique 1 Global, que se carga con $10,000 en fondos de prueba. Esto le permite explorar y practicar el trading en varios instrumentos financieros como CFDs, forex, criptomonedas y más. Puede probar estrategias, gestionar el riesgo y familiarizarse con las condiciones reales del mercado. 

4.3.3. Tiene la flexibilidad de cambiar entre el modo demo y el modo de trading en vivo en cualquier momento. En modo demo, puede experimentar con estrategias de trading, gestionar el riesgo y observar cómo las diferentes condiciones del mercado impactan su cartera, todo sin la presión de arriesgar fondos reales. Una vez que se sienta cómodo y seguro con sus habilidades de trading, puede hacer la transición sin problemas al modo de trading en vivo para comenzar a operar con fondos reales. Esta transición está completamente bajo su control, lo que le permite practicar y perfeccionar sus habilidades de trading antes de entrar en los mercados en vivo. 

 

4.4. Recursos educativos 

4.4.1. Unique 1 Global ofrece un Centro de Educación diseñado para apoyar a los traders de todos los niveles de experiencia. Sea nuevo en el trading o esté buscando perfeccionar sus estrategias, ofrecemos una amplia gama de materiales para ayudarle a tener éxito: 

Además de la educación en trading, ofrecemos tutoriales completos que te guían en el uso de la Plataforma. Estas guías paso a paso están diseñadas para ayudarle a entender cómo usar las funcionalidades de la plataforma, incluyendo la creación de cuentas. 

Al proporcionar estos recursos, nuestro objetivo es capacitar a nuestros usuarios con el conocimiento y las habilidades necesarias para tomar decisiones informadas, mejorar sus estrategias de trading y aprovechar al máximo las capacidades de la Plataforma. 

 

5. Cuenta de usuario 

 

5.1. Solicitar una cuenta Unique 1 Global 

5.1.1. Para comenzar a utilizar los servicios ofrecidos por Unique 1 Global, los usuarios deben primero solicitar una cuenta de Unique 1 Global. El proceso de solicitud está diseñado para asegurar que todos los usuarios cumplan con los requisitos legales, regulatorios y de seguridad necesarios. A continuación se presentan los pasos clave en el proceso. 

5.1.2. Para solicitar una cuenta Unique 1 Global, los usuarios deben completar un formulario de solicitud en línea en la Plataforma. El formulario requiere que proporcione la siguiente información personal básica esencial para la verificación de identidad: nombre completo, país de residencia, número de teléfono, fecha de nacimiento y dirección de correo electrónico. Estos detalles son esenciales para el registro inicial. 

5.1.3. Una vez registrados, los usuarios comienzan en el Nivel Básico y tienen la opción de progresar a niveles superiores. Cada nivel viene con requisitos específicos de verificación y límites de depósito/retiro: 

Nivel Básico: 
en este nivel, tendrá acceso a las funciones básicas como depositar fondos y operar, pero no se permiten retiros; 
no se requiere verificación KYC para este nivel para comenzar a operar, pero se aplican ciertas limitaciones (por ejemplo, no se permiten retiros); 
Nivel 1: 
para habilitar los retiros, los usuarios deben completar el proceso de verificación KYC. La verificación incluye: un cuestionario básico para evaluar su perfil de riesgo, prueba de identidad (tarjeta de identificación válida, pasaporte o licencia de conducir o la opción de proporcionar otro documento dependiendo de su país de residencia), verificación de vida para confirmar que la persona que se registra es efectivamente el titular de la cuenta; 
se aplican límites totales de depósito/retiro basados en este nivel. Una vez que complete la verificación, podrá retirar fondos. 
Nivel 2: 
para eliminar los límites de retiro, los usuarios deben proporcionar documentación adicional, a saber, comprobante de domicilio (factura de servicios públicos, estado de cuenta bancario u otra documentación oficial que verifique su dirección); 
en este nivel, no hay límites de retiro. Los usuarios en este nivel también pueden acceder a funciones de trading mejoradas sin restricciones. 
El nivel de la cuenta determina no solo tus límites de depósito y retiro, sino también el grado en que realizamos las verificaciones KYC. 

5.1.4. Unique 1 Global se adhiere estrictamente a las medidas de Prevención de Lavado de Dinero (AML, por sus siglas en inglés), Financiación del Terrorismo (CTF, por sus siglas en inglés) y verificaciones de sanciones como parte del proceso de solicitud de cuenta. Estas medidas de cumplimiento están diseñadas para prevenir actividades ilegales como el lavado de dinero y la financiación del terrorismo, asegurar que todos los usuarios cumplan con los requisitos legales para las transacciones financieras (particularmente en las jurisdicciones donde opera Unique 1 Global), y realizar verificaciones de sanciones para confirmar que los usuarios no estén en ninguna lista de sanciones gubernamentales o internacionales. Al proporcionar los documentos requeridos, usted está consintiendo estas verificaciones de cumplimiento, las cuales pueden implicar compartir su información con autoridades regulatorias y terceros (consulte nuestra Política de Privacidad). 

5.1.5. Unique 1 Global puede realizar una Evaluación de Idoneidad y Apropiación para determinar si nuestros Servicios son adecuados para su perfil financiero y experiencia en trading. Esta evaluación es parte de nuestro compromiso de asegurar que a los usuarios se les ofrezcan Servicios que se alineen con su nivel de experiencia, capacidad financiera y tolerancia al riesgo (ver Sección 7 de estos Términos y Condiciones). 

5.1.6. Unique 1 Global tiene una estricta política de una cuenta por usuario. Esto significa que a cada usuario se le permite tener solo una cuenta activa de Unique 1 Global. La creación de múltiples cuentas está estrictamente prohibida. 

Si Unique 1 Global descubre que un usuario ha creado múltiples cuentas, nos reservamos el derecho de tomar las acciones necesarias, que pueden incluir: 

suspender o eliminar cuentas adicionales; 
combinar múltiples cuentas en una sola cuenta para asegurar el cumplimiento de estos Términos y Condiciones. 
Dichas acciones serán determinadas a discreción del equipo de cumplimiento de Unique 1 Global, quien evaluará la situación. 

 

5.2. Mantenimiento de su cuenta Unique 1 Global 

5.2.1. Unique 1 Global puede solicitar periódicamente información o documentación adicional a los usuarios para asegurar el cumplimiento de las leyes aplicables y otros requisitos regulatorios. Esto podría implicar la actualización de sus documentos de verificación de identidad, proporcionar detalles adicionales sobre sus transacciones financieras o confirmar cambios en su información personal. Los usuarios están obligados a responder de manera oportuna a estas solicitudes y proporcionar la información necesaria. El incumplimiento de esta obligación puede resultar en un retraso o suspensión de las actividades de la cuenta. 

5.2.2. Es responsabilidad del usuario notificar de inmediato a Unique 1 Global sobre cualquier cambio en la información proporcionada durante la verificación de identidad previa. Los usuarios deben informar a Unique 1 Global por escrito dentro de los 30 días siguientes a cualquier cambio, incluyendo, pero no limitado a, información personal, residencia y otros detalles relacionados con el cumplimiento, cambios en el estado (por ejemplo, cambios en el empleo, estado financiero, o cualquier otro detalle que pueda afectar su cuenta Unique 1 Global). El incumplimiento de la actualización de esta información de manera oportuna podría resultar en retrasos en el procesamiento de transacciones o problemas relacionados con la funcionalidad de la cuenta. 

5.2.3. Unique 1 Global confía en la información precisa y completa proporcionada por los usuarios durante el proceso de verificación y a lo largo del uso de nuestra Plataforma. Los usuarios deben asegurarse de que todos los detalles proporcionados sean correctos, verídicos y estén actualizados. Proporcionar información inexacta, incompleta o engañosa puede llevar a la suspensión o cierre de su cuenta Unique 1 Global, congelación de fondos o transacciones si se encuentran discrepancias, incapacidad para retirar fondos o realizar otras actividades en la Plataforma. 

5.2.4. Unique 1 Global se compromete a cumplir con las regulaciones AML/CTF, según lo establecido por las leyes de Saint Lucia y las normas internacionales pertinentes. Los usuarios deben cumplir con estas regulaciones proporcionando información precisa y presentando los documentos necesarios para la verificación de identidad, especialmente cuando lo solicite la Plataforma. 

 

5.3. Seguridad de la cuenta Unique 1 Global 

5.3.1. La seguridad de su cuenta Unique 1 Global es crucial para garantizar que sus datos personales y actividades de trading estén protegidos. Unique 1 Global ha implementado diversas medidas de seguridad para proteger su cuenta y minimizar el riesgo de acceso no autorizado. 

5.3.2. Al crear su cuenta en Unique 1 Global, es esencial que elija credenciales de inicio de sesión seguras, incluyendo una contraseña fuerte. Su contraseña debe ser única y no fácilmente adivinable para prevenir el acceso no autorizado. Es su responsabilidad mantener la confidencialidad de sus credenciales de inicio de sesión. Compartir sus datos de inicio de sesión con cualquier persona, ya sea intencionalmente o sin querer, puede exponer su cuenta a riesgos de seguridad. Unique 1 Global no se hará responsable de ninguna pérdida o daño resultante del uso indebido de sus credenciales de inicio de sesión. 

5.3.3. Unique 1 Global emplea características de seguridad adicionales para mejorar la protección de su cuenta. Estas medidas incluyen la autenticación de dos factores, la monitorización de amenazas de seguridad y la acción inmediata en cuentas comprometidas. 

5.3.4. Se le prohíbe permitir que cualquier tercero acceda a su cuenta de Unique 1 Global. Si se detecta acceso no autorizado, tomaremos medidas rápidas para asegurar la cuenta, incluyendo suspenderla o bloquearla hasta que verifiquemos las circunstancias. Unique 1 Global no será responsable de ninguna acción o pérdida resultante del acceso no autorizado o el uso de su cuenta, ya sea que el acceso haya sido permitido por usted o no. Es su responsabilidad monitorear regularmente la actividad de su cuenta y reportar cualquier comportamiento sospechoso de inmediato. 

 

5.4. Cerrar su cuenta Unique 1 Global 

5.4.1. En cualquier momento, tiene la opción de cerrar su cuenta Unique 1 Global. Sin embargo, el proceso de cierre de la cuenta implica varios pasos importantes para asegurar que todas las actividades se concluyan adecuadamente y que su cuenta se cierre de manera segura. 

5.4.2. Para iniciar el cierre de su cuenta Unique 1 Global, usted puede enviar una solicitud via email a support@uniqueoneglobal.com o utilizar la función de configuración de la cuenta dentro de la Plataforma. Por favor, siga las instrucciones proporcionadas en la configuración o en la comunicación por correo electrónico para enviar su solicitud de cierre. Una vez que su solicitud sea enviada, comenzaremos a procesar el cierre de su cuenta. 

5.4.3. Su cuenta se cerrará dentro de los 7 días siguientes a la recepción de su solicitud. Durante este período, se procesarán todas las acciones pendientes (como retiros o revisiones de cuenta). Si hay algún problema o retraso, se le notificará el plazo estimado para la resolución. 

5.4.4. Antes de enviar una solicitud para cerrar su cuenta Unique 1 Global, es importante cerrar cualquier operación o posición activa que pueda tener abierta. Cualquier operación en curso debe estar completamente liquidada, ya que no se puede procesar automáticamente una vez que se inicie el cierre de la cuenta. 

Es su responsabilidad asegurarse de que todas las operaciones estén completadas, ya que no seremos responsables de ninguna pérdida resultante de posiciones abiertas en el momento del cierre de la cuenta. 

Los usuarios son los únicos responsables de las órdenes pendientes o posiciones abiertas al iniciar el cierre de su cuenta. Si no cierra las operaciones o posiciones abiertas antes del cierre de la cuenta, acepta toda la responsabilidad por cualquier pérdida resultante o transacciones no procesadas. Unique 1 Global no será responsable de ningún resultado relacionado con operaciones no liquidadas o actividades financieras que permanezcan abiertas después del cierre de la cuenta. 

 

5.5. Bloqueo de su cuenta Unique 1 Global 

5.5.1. Unique 1 Global puede bloquear o suspender su cuenta en las siguientes situaciones: 

si un servicio que está utilizando ya no está disponible o está temporalmente suspendido por mantenimiento, razones de seguridad u operativas; 
si la información proporcionada durante el registro o verificación de la cuenta resulta ser inexacta, engañosa o incompleta, podemos suspender o congelar su cuenta hasta que se realicen las correcciones necesarias; 
si infringe cualquiera de nuestras políticas de trading o participa en actividades que violen los Términos y Condiciones, como prácticas de trading fraudulentas, manipulación del mercado o uso no autorizado de la Plataforma; 
si hay una amenaza potencial para la seguridad de su cuenta o de la Plataforma, como acceso no autorizado o actividades sospechosas. 
La lista de razones anterior es un ejemplo y no una lista completa y exhaustiva. El equipo de Unique 1 Global puede bloquear o eliminar tu cuenta en el transcurso de otras situaciones que podrían ser indicativas de un comportamiento inapropiado o acciones por parte de un usuario que son inconsistentes con las políticas de Unique 1 Global. Dicha decisión queda a discreción del equipo de Unique 1 Global. 

5.5.2. En algunos casos, puede ser necesaria una acción inmediata para proteger su cuenta o cumplir con obligaciones legales, y Unique 1 Global puede bloquear o congelar cuentas sin previo aviso. Tales situaciones incluyen: 

si detectamos posibles fraudes, intentos de hackeo o actividades sospechosas que amenacen la integridad de la Plataforma o de su cuenta, podemos tomar medidas inmediatas para prevenir daños adicionales; 
en casos donde debamos cumplir con requisitos legales o regulatorios, como congelar cuentas involucradas en actividades sospechosas de lavado de dinero o financiamiento del terrorismo. 
Aunque nuestro objetivo es informarle sobre cualquier acción tomada en su cuenta, algunas situaciones pueden requerir que actuemos rápidamente de acuerdo con las obligaciones legales y regulatorias. 

5.5.3. Incluso si su cuenta Unique 1 Global está congelada, suspendida o cerrada, sus registros de trading seguirán siendo accesibles en la Plataforma durante al menos cinco años a partir de la fecha de cierre de la cuenta. Este período de retención está en vigor para cumplir con los requisitos legales y regulatorios. En algunos casos, el período de retención puede extenderse si lo exige la Ley Aplicable. 

 

5.6. Especificaciones de Prevención de Lavado de Dinero (AML) 

5.6.1. Unique 1 Global se adhiere a las regulaciones AML y CTF establecidas en las jurisdicciones de operación. Implementamos las siguientes medidas para cumplir con los requisitos regulatorios locales: 

Unique 1 Global puede requerir documentos de verificación adicionales a los usuarios en los países de la región EEE para cumplir con las regulaciones locales de AML, incluyendo prueba de identidad, de domicilio y otra información relevante; 
Unique 1 Global se reserva el derecho de solicitar documentos de verificación adicionales a los usuarios según su país de residencia; 
el incumplimiento de los requisitos de AML y KYC resultará en la suspensión o congelación de su cuenta. 
Además, las cuentas sospechosas de participar en lavado de dinero, financiamiento del terrorismo u otras actividades ilegales serán congeladas de inmediato, y el asunto podrá ser reportado a las autoridades correspondientes para una investigación adicional. 

 

6. Proceso de financiación y retiro de cuentas Unique 1 Global 

 

6.1. Métodos de pago 

6.1.1. Unique 1 Global admite varios métodos de pago para que los usuarios depositen fondos en su cuenta de Unique 1 Global. Para garantizar la seguridad y el cumplimiento de todas las transacciones, se requiere que los usuarios vinculen sus cuentas exclusivamente con métodos de pago aprobados, que pueden incluir, entre otros, cuentas bancarias, tarjetas de débito y crédito, monederos electrónicos o criptomonedas. 

6.1.2. La disponibilidad y aceptación de estos métodos de pago pueden depender de la ubicación geográfica del usuario y del criterio de la Plataforma. Ciertos métodos de pago pueden estar disponibles en regiones específicas, mientras que otros pueden estar limitados o sujetos a cambios según los requisitos regulatorios locales. 

6.1.3. Es fundamental que el método de pago asociado a la cuenta Unique 1 Global se encuentre registrado en el nombre del usuario. Se puede solicitar a los usuarios que suministren documentos de comprobación para confirmar la propiedad del método de pago asociado a su cuenta. El incumplimiento de este proceso de verificación o la provisión de información inexacta puede resultar en la imposición de limitaciones en las capacidades de depósito o restricciones en el uso de la cuenta Unique 1 Global. Además, Unique 1 Global se reserva el derecho de rechazar o devolver los fondos recibidos de un método de pago no registrado a nombre del usuario. En tales casos, Unique 1 Global puede deducir cualquier tarifa de devolución asociada. 

 

6.2. Financiación de su cuenta Unique 1 Global 

6.2.1. Tiene la opción de depositar fondos en tu cuenta Unique 1 Global utilizando uno de los métodos de pago aprobados designados facilitados por nuestra Plataforma. Tenga en cuenta que no se aceptan efectivo ni cheques como métodos de depósito válidos. 

6.2.2. El proceso de depósito de fondos incluye los siguientes pasos: 

Al iniciar su depósito, sus fondos serán sometidos a una verificación exhaustiva y a un control de cumplimiento de acuerdo con los requisitos legales y regulatorios aplicables. 
Una vez que se completen las verificaciones necesarias, su depósito será acreditado a su cuenta Unique 1 Global, y el monto se reflejará en su saldo. 
6.2.3. Tenga en cuenta que pueden aplicarse limitaciones específicas a los montos de los depósitos, y estas limitaciones se le comunicarán con anticipación, si corresponde. Unique 1 Global se reserva el derecho de imponer límites de depósito predeterminados basados en requisitos regulatorios u otros factores relevantes para el cumplimiento de las leyes locales. 

6.2.4. Cualquier cargo o tarifa impuesta por el método de pago que elija puede dar lugar a la imposición de una tarifa de transferencia, que estarán claramente delineados y disponibles para referencia en nuestra Plataforma o en la documentación proporcionada. 

 

6.3. Retiros de su cuenta Unique 1 Global 

6.3.1. Retirar fondos de su cuenta Unique 1 Global puede iniciarse al mismo método de pago previamente utilizado para los depósitos, siempre que cumpla con los estándares regulatorios y la Ley Aplicable. Si es necesario, Unique 1 Global puede aprobar retiros a un método de pago alternativo, siempre que también esté registrado a nombre del usuario. 

6.3.2. Para garantizar la seguridad de las transacciones y el cumplimiento de las normas regulatorias, los retiros de su cuenta Unique 1 Global solo están disponibles para los usuarios que hayan completado el proceso de verificación KYC. Esto se aplica a los usuarios de Nivel 1 y Nivel 2. 

Para habilitar los retiros, los usuarios deben completar la verificación KYC en el Nivel 1, lo que incluye enviar un cuestionario básico, prueba de identidad (como una identificación nacional, pasaporte o licencia de conducir) y completar la verificación de vida. 
Los usuarios que deseen eliminar los límites de retiro y obtener retiros ilimitados deben proporcionar prueba de domicilio (como una factura de servicios públicos, un estado de cuenta bancario o un documento oficial) como parte de su verificación de Nivel 2. 
Las solicitudes de retiro de cuentas de nivel Básico, donde los usuarios no han completado el proceso de verificación KYC, no serán procesadas. 

6.3.3. Proceso de retiro 

Los montos mínimos de retiro se especificarán claramente en nuestra Plataforma para su referencia. Estos límites se establecen de acuerdo con las normas legales y regulatorias. 
Como parte de nuestro compromiso con la transparencia, tenga en cuenta que ciertos retiros pueden incurrir en tarifas, las cuales se detallarán claramente en nuestra Plataforma. Estas tarifas dependen del método de retiro elegido y están en línea con los estándares de la industria. 
Nuestro objetivo es procesar las solicitudes de retiro de manera rápida, generalmente dentro de un día hábil. Sin embargo, las verificaciones de cumplimiento y los retrasos asociados con los procesadores de pagos pueden afectar el tiempo de procesamiento. 
6.3.4. Los retiros se procesan según la zona horaria de la Hora de Europa del Este (en adelante, "EET"). Si envía una solicitud de retiro después de las 11:00 am EET o en días no laborables, se procesará el siguiente día hábil. Este plazo no tiene en cuenta los días festivos o los días no laborables en Saint Lucia u otras ubicaciones bancarias relevantes que puedan afectar el proceso de retiro. 

6.3.5. Además, Unique 1 Global tiene la prerrogativa de procesar retiros a través de entidades afiliadas vinculadas a los Servicios de la Plataforma. Sin embargo, los usuarios deben tener en cuenta que nos reservamos el derecho de revertir o inhibir retiros si se identifican violaciones de los Términos y Condiciones de la Plataforma o infracciones regulatorias. Estas medidas se implementan para salvaguardar nuestras políticas, garantizar el cumplimiento normativo y mantener la integridad y seguridad de la Plataforma. 

 

7. Evaluaciones de Idoneidad y Apropiación 

7.1. En Unique 1 Global, priorizamos el bienestar financiero de nuestros usuarios realizando exhaustivas Evaluaciones de Idoneidad y Apropiación antes de que utilicen nuestros Servicios, particularmente con las herramientas de copy trading y trading apalancado. Estas evaluaciones aseguran que los Servicios que ofrecemos estén adaptados a su perfil financiero, objetivos y experiencia. 

7.2. La evaluación de idoneidad tiene en cuenta varios factores clave, incluyendo: 

su comprensión de los mercados financieros y los instrumentos que se están negociando; 
su experiencia previa en trading o inversión, incluyendo cualquier conocimiento de mercados financieros, instrumentos o estrategias; 
sus objetivos y metas específicos en términos de rendimientos, tolerancia al riesgo y horizontes de tiempo; 
una revisión de su situación financiera para evaluar si los Servicios que ofrecemos son apropiados dado sus recursos y capacidad de riesgo. 
Estos factores nos ayudan a determinar si nuestras herramientas de copy trading y otros Servicios son adecuados para sus necesidades y si puede manejar los riesgos involucrados en los Servicios de Trading. 

7.3. Al operar con apalancamiento o utilizar servicios de copy trading, es crucial que proporcione información precisa y completa. Esta información se utilizará para evaluar si nuestros Servicios son apropiados para su situación financiera y experiencia en el trading. La falta de proporcionar la información necesaria puede afectar su capacidad para ejecutar operaciones de manera efectiva o acceder a ciertas funciones dentro de la Plataforma. Por ejemplo, sin detalles precisos sobre su situación financiera o sus objetivos de inversión, puede verse restringido en el acceso a ciertas opciones de trading de alto riesgo o características que requieren un escrutinio regulatorio adicional. 

7.4. Sus circunstancias financieras y su experiencia en el trading pueden cambiar con el tiempo. Para asegurarnos de que los Servicios que ofrecemos sigan satisfaciendo sus necesidades, es esencial mantenernos actualizados sobre cualquier cambio, incluyendo cambios en su conocimiento de inversiones, alteraciones en su situación financiera, modificaciones en sus objetivos de inversión y cambios en su experiencia en los mercados financieros. Al mantenernos informados, nos permite reevaluar la idoneidad de nuestros Servicios para sus necesidades en evolución. Esta evaluación continua asegura que nuestra Plataforma siga alineada con sus objetivos y capacidades financieras, permitiéndonos ajustar y personalizar nuestros Servicios según sea necesario. 

7.5. Unique 1 Global se compromete a realizar Evaluaciones de Idoneidad y Apropiación en plena conformidad con las regulaciones en las jurisdicciones de operación. Significa que tomamos en cuenta los requisitos regulatorios locales y los riesgos del mercado, como las fluctuaciones de divisas y los cambios en los marcos regulatorios. Proporcionamos divulgaciones de riesgos para ayudar a los usuarios a comprender los riesgos potenciales involucrados en el comercio en Unique 1 Global. Estas divulgaciones están diseñadas para capacitarle a tomar decisiones informadas y a interactuar con nuestros Servicios de manera responsable. 

7.6. Las Evaluaciones de Idoneidad y Apropiación se realizan durante el proceso inicial de verificación del usuario, pero esto no es un evento único. Este proceso de evaluación es continuo, asegurando que nuestros Servicios ofrecidos por Unique 1 Global sigan siendo adecuados para el perfil financiero en evolución, la experiencia de inversión y la tolerancia al riesgo de cada usuario. Estas evaluaciones son esenciales para garantizar que los usuarios reciban continuamente Servicios que se alineen con sus objetivos de inversión actuales y su situación financiera. Al revisar regularmente estos factores, Unique 1 Global puede monitorear los perfiles de riesgo cambiantes y ajustar los servicios según sea necesario para apoyar a los usuarios en el logro de sus objetivos financieros. 

 

8. Gestión de pedidos 

 

8.1. Realización de pedidos 

8.1.1. Al utilizar los Servicios de Trading de Unique 1 Global, los usuarios participan en el proceso de realizar órdenes para comprar, vender o negociar instrumentos financieros. Estas órdenes pueden incluir órdenes limitadas, órdenes de stop loss, órdenes de take profit y otros tipos de instrucciones de trading. Unique 1 Global se compromete a ejecutar estas órdenes según las instrucciones específicas proporcionadas por el usuario, asegurando que todas las solicitudes se procesen con precisión. 

8.1.2. Los pedidos pueden realizarse a través de nuestra Plataforma, que ofrece al usuario la flexibilidad de iniciar manualmente las operaciones o utilizar servicios automatizados para realizar pedidos. Tenga en cuenta los siguientes detalles importantes sobre la ejecución de órdenes: 

El precio de ejecución de las órdenes puede variar del precio inicialmente solicitado debido a la volatilidad del mercado o fluctuaciones, comúnmente conocidas como deslizamiento. El deslizamiento puede ocurrir durante períodos de alta actividad en el mercado o cuando las condiciones del mercado cambian rápidamente. Es importante reconocer que el deslizamiento puede afectar el precio al que se ejecuta su orden. 
Las órdenes realizadas durante las suspensiones del mercado se ejecutarán una vez que se reanude la negociación. Sin embargo, Unique 1 Global no garantiza que el precio de ejecución coincida con el precio de mercado en el momento en que se realizó la orden. Los usuarios deben ser conscientes de la posibilidad de diferencias de precio al momento de la ejecución durante tales períodos. 
8.1.3. Los usuarios están obligados a realizar pedidos exclusivamente a través de la Plataforma, que incluye Unique 1 Global Web, MT5 y la aplicación Unique 1 Global para Android. Estas plataformas proporcionan canales seguros, regulados y auditables para el comercio, asegurando que todas las órdenes se ejecuten con integridad y transparencia. No se aceptan pedidos telefónicos ni pedidos realizados a través de ningún otro método fuera de estas plataformas. 

8.1.4. Es esencial que los usuarios ejerzan precaución al realizar pedidos, ya que los pedidos no intencionados o duplicados pueden ejecutarse asumiendo una acción deliberada. Una vez que se realiza un pedido, este se procesará de acuerdo con las instrucciones proporcionadas. Los usuarios son responsables de revisar y confirmar los detalles antes de enviar sus pedidos. 

8.1.5. Unique 1 Global opera dentro de los horarios de negociación designados para diferentes instrumentos financieros. Los usuarios son responsables de asegurarse de que sus órdenes se realicen durante estas horas, ya que las órdenes realizadas fuera del horario de mercado especificado pueden enfrentar retrasos o restricciones en su ejecución. Unique 1 Global no se hace responsable de los retrasos o restricciones en los pedidos realizados fuera del horario de negociación designado. Cualquier problema de este tipo resultante de pedidos realizados en estos momentos es responsabilidad del usuario. 

 

8.2. Cancelación de pedidos 

8.2.1. Unique 1 Global proporciona a los usuarios la capacidad de modificar o cancelar órdenes no ejecutadas. Sin embargo, tenga en cuenta que estas solicitudes están sujetas a ciertas condiciones, y Unique 1 Global no garantiza el cumplimiento de estas solicitudes. 

8.2.3. Los usuarios pueden solicitar la modificación o cancelación de sus pedidos, siempre que el pedido no haya sido ejecutado aún. Sin embargo, hay circunstancias bajo las cuales Unique 1 Global puede no aceptar o cumplir con estas solicitudes, incluyendo: 

si hay preocupaciones respecto a la seguridad de la cuenta o la transacción, nos reservamos el derecho de rechazar las solicitudes de cancelación o modificación; 
si no hay fondos suficientes en la cuenta para cumplir con las modificaciones o cancelaciones solicitadas, es posible que no podamos procesar la solicitud; 
si la orden contiene errores o inconsistencias, como precios o instrucciones incorrectas, podemos rechazar la solicitud; 
cambios en las condiciones del mercado, regulaciones o requisitos legales pueden afectar nuestra capacidad para cancelar o modificar órdenes; 
en casos de incumplimiento de las reglas de negociación o eventos de incumplimiento, Unique 1 Global puede no aceptar solicitudes de cancelación o modificación. 
8.2.4. Si un pedido es rechazado, ejecutado o cancelado, los usuarios serán notificados a través de Unique 1 Global. Esto asegura que los usuarios estén informados sobre el estado de sus solicitudes y cualquier acción tomada en sus pedidos. 

8.2.5. En los casos en que Unique 1 Global cancele o rechace un pedido, cualquier tarifa aplicable incurrida será reembolsada a la cuenta de Unique 1 Global del usuario. Los usuarios serán notificados si se emiten tales reembolsos. 

8.2.6. Para las transacciones ejecutadas, Unique 1 Global puede tomar acciones correctivas en ciertos casos, según lo establecido en nuestras políticas. Estas acciones pueden incluir la reversión de transacciones, el ajuste de precios o la provisión de compensación si corresponde. 

8.2.7. Los usuarios acuerdan indemnizar y mantener indemne a Unique 1 Global de cualquier pérdida o daño que surja de modificaciones, cancelaciones o no aceptación de pedidos. Unique 1 Global no es responsable de ningún problema que resulte de la falta de un usuario para realizar, modificar o cancelar pedidos de acuerdo con las reglas de la Plataforma. 

 

8.3. Estrategia de ejecución 

8.3.1. En Unique 1 Global, nuestro objetivo es obtener el mejor resultado financiero posible al ejecutar órdenes, lo que significa considerar el impacto colectivo de todas tus operaciones. Las operaciones individuales pueden parecer menos favorables cuando se ven por separado. Para asegurar el mejor interés de todos nuestros usuarios, podemos agregar o dividir su pedido con nuestros propios pedidos o los de otros usuarios. 

8.3.2. Esta agregación o división de pedidos no está determinada únicamente por el precio. Tomamos en cuenta varios elementos, como la velocidad de la operación y el posible éxito de la transacción, al tomar estas decisiones. En consecuencia, esto puede resultar en ocasiones en términos o precios más favorables para usted, mientras que en otras ocasiones podría llevar a términos o precios menos favorables en comparación con la ejecución de órdenes individuales. 

 

9. Registro de información 

9.1. Sus actividades de trading dentro de la Plataforma, que abarcan tanto las operaciones concluidas como las posiciones actuales, junto con los saldos de margen y efectivo (en adelante, colectivamente - "Información de la Cuenta") accesibles a través de su cuenta en línea de Unique 1 Global. Cualquier actualización o alteración de esta Información de Cuenta se reflejará dentro de las 24 horas posteriores a la ocurrencia de cualquier actividad relacionada. Esta información es convenientemente filtrable según varios criterios para su fácil referencia y análisis. 

9.2. En caso de detectar alguna discrepancia en la Información de su Cuenta, le solicitamos amablemente que nos notifique dentro de un período de 48 horas a partir de la publicación de dicha información. El no informar discrepancias dentro de este período especificado resultará en que la Información de la Cuenta se considere como evidencia concluyente de sus transacciones, operaciones, posiciones y saldos respectivos. Es imperativo señalar que mantenemos y conservamos sus registros, incluyendo la Información de la Cuenta, por un período mínimo de cinco años después del cierre de su cuenta. Este período de retención puede extenderse según lo exigido por la Ley Aplicable o mediante un acuerdo mutuo documentado por escrito entre Unique 1 Global y el titular de la cuenta. 

9.3. Al utilizar nuestros Servicios, usted reconoce y consiente la grabación de cualquier conversación telefónica, correo electrónico, chat u otras formas de comunicación, actividades y transacciones entre usted y nosotros. Estas grabaciones pueden ser utilizadas como prueba en procedimientos asociados con estos Términos y Condiciones, cualquier pedido realizado o transacciones ejecutadas. Se entiende que estos registros seguirán siendo propiedad exclusiva de nuestra organización. 

 

10. Tarifas y costos 

10.1. Unique 1 Global implementa un diferencial como mecanismo de tarifa para la ejecución de órdenes, y este diferencial varía según el tipo de producto y servicio, cuyos detalles están fácilmente disponibles en nuestra Plataforma. Dada la naturaleza dinámica de las condiciones del mercado, los diferenciales pueden experimentar cambios entre las fases de colocación y ejecución de la orden. Específicamente, se pueden observar spreads más amplios durante las horas fuera del mercado debido a la disminución de la liquidez y la posible mayor volatilidad en el entorno del mercado. 

10.2. Además, se aplican diversas tarifas en diferentes aspectos de nuestros Servicios. Estas tarifas incluyen cargos relacionados con depósitos, retiros y conversiones de divisas, incorporando tarifas de transferencia, tarifas por devolver fondos de fuentes no verificadas, cargos por retiros, etc. Además, se podría aplicar una tarifa por inactividad mensualmente si no hay actividad de trading en su cuenta Unique 1 Global durante un período consecutivo de 2 meses. 

10.3. Nuestra diversa gama de Servicios puede incurrir en tarifas distintas. Es su responsabilidad mantenerse al tanto de estas tarifas consultando regularmente nuestra Plataforma y los horarios asociados, asegurándose de estar al tanto de la última estructura de tarifas. Cualquier tarifa adeudada a Unique 1 Global se deducirá del saldo disponible en su cuenta Unique 1 Global. 

10.4. Nuestro objetivo es garantizar la transparencia en las tarifas y cargos. Aunque las tarifas pueden no mostrarse en las monedas locales, los usuarios deben ser conscientes de que los depósitos y retiros pueden estar sujetos a conversiones de divisas y tarifas bancarias adicionales fuera de nuestro control. Se incentiva a los usuarios a revisar la lista completa de tarifas y considerar posibles cargos de terceros al realizar transacciones. 

10.5. Unique 1 Global puede aplicar tasas de conversión de moneda para depósitos, retiros y transacciones. Los usuarios de los países de la región de EEE deben tener en cuenta que pueden aplicarse tarifas de conversión y fluctuaciones en las tasas de cambio. Aunque no mostramos las tarifas en las monedas locales, las tasas de conversión aplicables se indicarán de manera transparente durante el proceso de transacción. Los usuarios también deben considerar posibles cargos adicionales de bancos o proveedores de pagos que están fuera de nuestro control. 

 

11. Reglas de Trading 

11.1. Al utilizar los Servicios de Unique 1 Global, es crucial adherirse a las reglas y directrices establecidas para mantener la integridad y equidad de nuestra Plataforma. Estas reglas están en vigor para garantizar que todos los usuarios puedan comerciar en un entorno seguro, legal y transparente, promoviendo la confianza y el cumplimiento de los estándares legales. 

11.2. Se prohíbe estrictamente a los usuarios participar en cualquier acción que implique la ingeniería inversa o la elusión de las medidas de seguridad dentro del Unique 1 Global. Esto incluye, pero no se limita a: 

intentar descomponer o alterar el software o los sistemas de la Plataforma para fines no autorizados; 
usar herramientas, inteligencia artificial o cualquier método diseñado para manipular el sistema u obtener una ventaja injusta en el trading. 
Tales actividades se consideran violaciones de la integridad de la Plataforma y resultarán en acciones inmediatas, incluyendo la suspensión o terminación de la cuenta del usuario. 

11.3. Unique 1 Global se compromete a proporcionar un entorno de trading justo y transparente. Los usuarios deben evitar participar en prácticas de trading que estén diseñadas para manipular el mercado o aprovecharse de la Plataforma de manera injusta. Las prácticas prohibidas incluyen: 

realizar órdenes de compra y venta para los mismos o similares productos en intervalos idénticos o muy cercanos, comúnmente conocido como wash trading, está estrictamente prohibido; 
cualquier operación realizada con la intención de manipular la Plataforma, como influir en los precios de los activos mediante medios artificiales, no está permitida. Esto incluye el spoofing, donde un trader coloca una orden que no tiene la intención de ejecutar, para engañar a otros traders o al sistema. 
11.4. En Unique 1 Global, esperamos que los usuarios actúen de manera ética y dentro de los límites legales al participar en cualquier actividad de trading. El comportamiento abusivo o las tácticas manipulativas no son tolerados. Los usuarios deben abstenerse de: 

intentar explotar pequeñas discrepancias de precios a través de operaciones rápidas y de alta frecuencia que violen el uso justo; 
aprovechar errores de precios, precios fuera del mercado o fallos en el sistema para obtener ganancias ilícitas; 
participar en comportamientos abusivos, ofensivos o disruptivos en Unique 1 Global, ya sea a través de canales de comunicación o acciones de trading, está estrictamente prohibido. 
11.5. Todos los usuarios deben asegurarse de que sus órdenes cumplan con las reglas, regulaciones y leyes aplicables que rigen los valores, productos básicos y otros instrumentos financieros. El incumplimiento de los requisitos legales, incluyendo la realización de órdenes fraudulentas o el intento de manipular las condiciones del mercado, se considera una violación de nuestros Términos y Condiciones. 

11.6. El incumplimiento de estas Reglas de Trading puede resultar en acciones estrictas tomadas por Unique 1 Global, incluyendo, pero no limitado a: 

Confiscación de ganancias. Cualquier ganancia obtenida por violar estas Reglas de Trading puede ser retenida o deducida de su cuenta de Unique 1 Global, incluso si ya ha sido desembolsada. Esto es para asegurar que ningún usuario se beneficie de prácticas comerciales desleales. 
Suspensión o terminación de la cuenta. Las instancias de violaciones serán registradas, y Unique 1 Global se reserva el derecho, de acuerdo con la Ley Aplicable, de tomar acciones que incluyen la cancelación de pedidos que violen las políticas de la Plataforma, la congelación o el bloqueo de su cuenta si se detectan actividades sospechosas, la terminación de los Servicios y el cierre de la cuenta sin previo aviso en casos graves de infracciones de las reglas. Estas acciones se toman a discreción de Unique 1 Global y pueden ocurrir con efecto inmediato en casos de violaciones sospechosas que representen una amenaza para la integridad, seguridad o cumplimiento legal de la Plataforma. 
11.7. Al utilizar los Servicios de Unique 1 Global, usted reconoce y acepta cumplir estrictamente con las Reglas de Trading como una condición fundamental de su participación en la Plataforma. Unique 1 Global se compromete a proporcionar un entorno de trading justo y seguro, y contamos con que todos los usuarios actúen de manera responsable y ética en todas sus actividades de trading. 

 

12. Limitaciones a nuestros Servicios 

12.1. En Unique 1 Global, operamos bajo principios rectores específicos diseñados para garantizar una Plataforma segura, transparente y justa para todos los usuarios. 

12.2. Unique 1 Global proporciona a los usuarios acceso a herramientas de trading avanzadas, recursos e información para ayudarles a tomar decisiones informadas. Sin embargo, es importante tener en cuenta que: 

Unique 1 Global no ofrece asesoramiento de inversión personalizado adaptado a sus circunstancias financieras individuales, objetivos o perfil de riesgo. 
Unique 1 Global no proporciona asesoramiento fiscal. Cualquier información en la Plataforma está destinada a guiar a los usuarios en la gestión de sus operaciones e inversiones, pero no ofrecemos orientación o recomendaciones específicas relacionadas con impuestos. 
Se incentiva a los usuarios a consultar con asesores financieros o profesionales fiscales con licencia para obtener recomendaciones de inversión personalizadas o asesoramiento fiscal basado en sus necesidades individuales y situaciones financieras. 

12.3. Unique 1 Global opera únicamente como una plataforma de trading digital. Nuestra Plataforma facilita las actividades de trading, pero no es un intercambio ni un mercado. 

Todas las operaciones, compras y ventas deben ser iniciadas, ejecutadas y concluidas exclusivamente dentro de Unique 1 Global. Proporcionamos un entorno controlado y seguro para que los usuarios realicen actividades de trading, asegurando la integridad y seguridad de todas las transacciones dentro de la Plataforma. 

Los precios mostrados en Unique 1 Global pueden diferir de los ofrecidos por otros corredores o de los precios de mercado vigentes. Estas discrepancias son inherentes a la estructura de precios interna de la Plataforma y pueden deberse a factores como la liquidez, la velocidad de ejecución o las tarifas específicas de la plataforma. Los usuarios deben ser conscientes de estas diferencias y tenerlas en cuenta al tomar decisiones al ejecutar operaciones. 

12.4. Unique 1 Global permite a los usuarios ejecutar operaciones fuera de los mercados tradicionales y regulados. Si bien esto ofrece una mayor flexibilidad y acceso a oportunidades de trading únicas, también implica riesgos adicionales: 

ciertos activos pueden tener una liquidez limitada, lo que dificulta ejecutar operaciones rápidamente o a los precios deseados; 
los activos negociados fuera de los mercados regulados pueden experimentar niveles más altos de fluctuaciones de precios, lo que podría afectar el precio de ejecución; 
las operaciones fuera de mercado pueden no estar sujetas a la misma supervisión regulatoria o leyes de protección al consumidor que las operaciones realizadas en intercambios tradicionales. 
Aunque Unique 1 Global proporciona acceso a estas oportunidades de trading, los usuarios son los únicos responsables de los riesgos asociados con estas transacciones. Recomendamos encarecidamente a los usuarios que lleven a cabo su propia responsabilidad y comprendan a fondo los riesgos antes de participar en operaciones fuera de los mercados regulados. 

 

13. Limitaciones de responsabilidad 

13.1. Unique 1 Global se compromete a ofrecer una Plataforma segura y efectiva, pero es importante que los usuarios comprendan las limitaciones inherentes a nuestra responsabilidad; 

los usuarios reconocen que Unique 1 Global no garantiza ganancias, ni proporciona garantías sobre el éxito o resultado de cualquier operación; 
el rendimiento pasado de los activos o traders no garantiza resultados futuros, y los usuarios solo deben participar en actividades de trading con capital que puedan permitirse perder; 
debido a la volatilidad del mercado, los precios pueden fluctuar rápidamente, y las operaciones pueden ejecutarse a precios diferentes de los esperados o inicialmente establecidos; 
Unique 1 Global puede permitir a los usuarios realizar operaciones fuera de los mercados tradicionales y regulados. Estas operaciones conllevan riesgos adicionales, como restricciones de liquidez, volatilidad de precios e incertidumbres regulatorias; 
Unique 1 Global emplea protocolos de seguridad avanzados, pero no somos responsables de ninguna pérdida resultante del acceso no autorizado a su cuenta de Unique 1 Global, como por negligencia en el mantenimiento de las credenciales de inicio de sesión o la falta de habilitación de la autenticación de dos factores; 
si terceros acceden a su cuenta debido a negligencia o mal uso de las credenciales, Unique 1 Global no será responsable de ninguna pérdida o actividad fraudulenta resultante; 
aunque nuestro objetivo es proporcionar una Plataforma completamente operativa en todo momento, Unique 1 Global no es responsable de ninguna pérdida resultante de tiempo de inactividad de la Plataforma, interrupciones del servicio o retrasos causados por eventos imprevistos como fallos técnicos, problemas de red o interrupciones en los servicios de terceros; 
Unique 1 Global no será responsable de ningún incumplimiento de sus obligaciones bajo estos Términos y Condiciones debido a eventos fuera de nuestro control (eventos de fuerza mayor); 
los usuarios reconocen que Unique 1 Global no puede garantizar la ejecución inmediata de las órdenes debido a factores como las condiciones del mercado, la latencia de la red o el deslizamiento. No somos responsables de ninguna pérdida que surja de tales retrasos; 
Unique 1 Global puede incluir servicios de terceros como procesadores de pagos, proveedores de liquidez y herramientas de análisis. No controlamos estos servicios de terceros y no somos responsables de ningún fallo o problema que surja del uso de estos servicios externos; 
si utilizas plataformas o servicios de terceros en conexión con los Servicios de Unique 1 Global, lo haces bajo tu propio riesgo. Unique 1 Global no es responsable de ningún problema, incluyendo violaciones de datos, pérdidas o interrupciones del servicio, que puedan surgir del uso de plataformas de terceros; 
los usuarios acuerdan indemnizar y mantener indemne a Unique 1 Global de cualquier reclamación, daño o pérdida que surja de la violación de estos Términos y Condiciones o de cualquier ley aplicable mientras utilizan la Plataforma, el uso indebido de los Servicios, la negligencia del usuario; 
Unique 1 Global no es responsable de ninguna pérdida de fondos resultante de riesgos de mercado o decisiones de trading tomadas por los usuarios. No asumimos responsabilidad por ninguna ganancia o pérdida derivada de operaciones individuales o estrategias de trading a largo plazo; 
Unique 1 Global no es responsable de ninguna pérdida incurrida como resultado de consejos o recomendaciones proporcionados por terceros, incluidos los traders copiados en la plataforma, analistas externos o asesores financieros; 
si bien Unique 1 Global hace esfuerzos razonables para mantener la disponibilidad continua del servicio, no ofrecemos garantías sobre la disponibilidad, precisión o fiabilidad de los Servicios o la Plataforma en todo momento. 
13.2. Las limitaciones de responsabilidad descritas anteriormente no son exhaustivas. Puede haber limitaciones o exclusiones adicionales de responsabilidad que se apliquen en circunstancias específicas, según lo permitan las leyes y regulaciones aplicables. Todas las limitaciones se aplican en estricta conformidad con las normas legales y regulatorias, asegurando el cumplimiento con las jurisdicciones pertinentes en las que opera Unique 1 Global. 

 

14. Riesgos clave de usar nuestros Servicios 

14.1. Uno de los principales riesgos en el comercio es la imprevisibilidad del mercado. Los mercados financieros están sujetos a fluctuaciones constantes, influenciadas por una amplia gama de factores como las condiciones económicas (por ejemplo, inflación, tasas de interés), eventos geopolíticos (por ejemplo, inestabilidad política, conflictos internacionales) y tendencias globales (por ejemplo, avances tecnológicos, cambios en los precios de las materias primas). Estos factores pueden causar cambios significativos en los precios de los activos, lo que puede resultar en rendimientos favorables o, por el contrario, en pérdidas sustanciales. Es importante señalar que las fluctuaciones del mercado son una parte natural del comercio y contribuyen al potencial tanto de ganancias como de pérdidas. 

14.2. El tamaño de la operación juega un papel significativo en el riesgo o la recompensa potencial. Las operaciones más grandes aumentan el potencial tanto de mayores ganancias como de mayores pérdidas. Por lo tanto, los usuarios deben evaluar cuidadosamente su tolerancia al riesgo y sus objetivos de inversión antes de realizar cualquier operación, especialmente si tienen la intención de participar en estrategias de alto volumen o alto riesgo. 

14.3. Operar con apalancamiento aumenta la exposición al riesgo de las fluctuaciones del mercado. El apalancamiento permite a los usuarios controlar posiciones más grandes con una inversión inicial relativamente menor. Aunque el apalancamiento puede magnificar las ganancias potenciales, también amplifica las pérdidas potenciales. Es esencial que los usuarios sean plenamente conscientes de los riesgos potenciales asociados con el trading apalancado y se aseguren de estar cómodos con el riesgo adicional antes de utilizar el apalancamiento. 

14.4. Es importante recordar que el rendimiento pasado no es un indicador fiable de los resultados futuros. Por lo tanto, los usuarios deben abordar sus estrategias de trading con precaución, reconociendo que cualquier activo o estrategia de trading puede desempeñarse de manera diferente en el futuro debido a las condiciones cambiantes del mercado. 

14.5. Aunque el copy trading ofrece la conveniencia de replicar automáticamente las operaciones de traders establecidos, los usuarios deben mantenerse alerta, vigilar y monitorear regularmente sus operaciones copiadas. Es fundamental la debida diligencia al elegir traders para replicar. Los usuarios deben revisar regularmente el rendimiento de las estrategias que están copiando y ejercer precaución al ajustar sus posiciones para adaptarse a los cambios del mercado. 

14.6. Unique 1 Global proporciona herramientas para ayudar a los usuarios a evaluar el rendimiento y el riesgo, pero la responsabilidad última recae en el usuario. Es fundamental mantenerse informado y realizar evaluaciones periódicas para asegurar la idoneidad continua de sus estrategias de trading. 

14.7. Operar en una plataforma digital, como Unique 1 Global, introduce a los usuarios a un conjunto único de riesgos inherentes al entorno en línea. Las fallas de los dispositivos representan un factor de riesgo significativo. Las fallas técnicas o los fallos en los dispositivos podrían interrumpir el proceso de negociación, lo que llevaría a oportunidades perdidas o transacciones incompletas. Además, los problemas de conectividad, como las conexiones a internet inestables o los problemas de servidor, pueden obstaculizar el acceso a la plataforma, impidiendo la ejecución de operaciones y resultando en posibles pérdidas financieras. 

14.8. El panorama digital es susceptible a intentos de hackeo y amenazas cibernéticas. El acceso no autorizado a cuentas personales, información sensible o datos de trading podría comprometer los activos y la seguridad financiera de los usuarios. El incumplimiento de las directrices de seguridad establecidas, como contraseñas débiles o medidas de protección inadecuadas, aumenta la vulnerabilidad a tales amenazas. 

14.9. Para una comprensión más detallada de los riesgos involucrados en el uso de los Servicios de Unique 1 Global, incluyendo el trading apalancado y el copy trading, por favor consulte nuestra Política de Divulgación de Riesgos. 

 

15. Conflictos de intereses 

15.1. Como proveedor de servicios responsable, Unique 1 Global busca activamente evitar conflictos de interés y toma medidas razonables para garantizar un trato justo a los clientes en tales situaciones. Sin embargo, ciertos casos pueden plantear intereses en conflicto entre Unique 1 Global y sus clientes o entre los propios clientes: 

Transacciones de cobertura. Podemos ejecutar transacciones de cobertura antes o después de gestionar su transacción para gestionar el riesgo, lo que podría afectar el precio de la transacción. Cualquier ganancia generada por estas actividades de cobertura será retenida por Unique 1 Global. 
Acuerdos y pagos. Podríamos entablar acuerdos con terceros u otros clientes que involucren pagos basados en actividades o volúmenes de trading, dentro de los límites de las leyes aplicables. Estos pagos podrían incluir reembolsos, comisiones, márgenes ampliados o participación en las ganancias. 
Honorarios, comisiones y beneficios no monetarios. Permitido bajo las leyes aplicables, podemos proporcionar, recibir o pagar honorarios, comisiones o beneficios no monetarios según lo regulado. 
Cargos de negociación y remuneración. Unique 1 Global podría compartir los cargos de negociación con sus empresas afiliadas o recibir remuneración de ellas en relación con las transacciones ejecutadas en su nombre. 
Contraparte en las operaciones. Unique 1 Global o sus empresas afiliadas pueden actuar como contrapartes en las operaciones que inicie. 
Establecimiento de precios de instrumentos. Unique 1 Global es responsable de establecer los precios de los instrumentos y productos en la Plataforma. En consecuencia, estos precios pueden diferir de los proporcionados por otros corredores o del precio de mercado en bolsas o plataformas de negociación. 
 

16. Jurisdicciones prohibidas 

16.1. La información en esta Plataforma y nuestros Servicios no está destinada a residentes de Afganistán, Albania, Argelia, Angola, Australia, Baréin, Bangladesh, Barbados, Bielorrusia, Benín, Bután, Bosnia y Herzegovina, Botsuana, Brasil, Burkina Faso, Burundi, Camboya, Camerún, Cabo Verde, República Centroafricana, Chad, China, Comoras, República Democrática del Congo, región de Crimea, Cuba, Yibuti, Egipto, Eritrea, Etiopía, Fiyi, Gabón, Ghana, Guinea, Haití, Irán, Irak, Jamaica, Jordania, Kenia, Kosovo, Kuwait, Laos, Líbano, Liberia, Libia, Macedonia del Norte, Madagascar, Malaui, Maldivas, Malí, Marruecos, Birmania, Namibia, Nepal, Níger, Nigeria, Corea del Norte, Chipre del Norte, Omán, Pakistán, Palaos, Puerto Rico, Catar, Rusia, Ruanda, Somalia, Senegal, Sudán del Sur, Sudán y Darfur, Siria, Tanzania, Togo, Trinidad y Tobago, Túnez, Tuvalu, el Reino Unido, los EE. UU., Vanuatu, Ciudad del Vaticano, Yemen, Zambia y Zimbabue, o para uso por cualquier persona en cualquier país o jurisdicción donde dicha distribución o uso sea contrario a la ley o regulación local. 

16.2. Además, Unique 1 Global se esfuerza por operar en cumplimiento con las sanciones regionales e internacionales. Los usuarios de países o regiones sancionados dentro de las jurisdicciones de operación, según lo identificado por las autoridades locales e internacionales, pueden verse restringidos de usar la Plataforma. 

 

17. Impuestos 

17.1. Las regulaciones y obligaciones fiscales pueden variar significativamente dependiendo de las circunstancias individuales y las jurisdicciones. Como usuario de Unique 1 Global, usted es el único responsable de garantizar el cumplimiento de todas las leyes fiscales relevantes que se aplican a sus actividades, incluyendo, pero no limitado a, la declaración y el pago de impuestos sobre cualquier beneficio o ganancia resultante de sus actividades de comercio o inversión. 

17.2. Es importante señalar que Unique 1 Global no proporciona asesoramiento fiscal ni determina las obligaciones fiscales de los usuarios. La Plataforma ofrece herramientas y servicios para el comercio y la inversión, pero la responsabilidad de entender y cumplir con sus obligaciones fiscales recae únicamente en usted. 

 

18. Reconocimientos, declaraciones y garantías del usuario 

18.1. Al utilizar la Plataforma, usted reconoce y garantiza que: 

tiene al menos 18 años de edad y posee la capacidad legal para celebrar este Acuerdo; 
es legalmente elegible para formar un acuerdo vinculante con Unique 1 Global de acuerdo con las leyes de su jurisdicción local; 
asume toda la responsabilidad de cumplir con la Ley Aplicable en su jurisdicción, incluidas las regulaciones de control de cambios; 
posee todos los consentimientos y la autoridad necesarios para interactuar con Unique 1 Global y sus Servicios; 
actúa en su propio nombre sin representar a otra persona, a menos que se acuerde explícitamente por escrito; 
toda la información y documentación proporcionada por usted es precisa, veraz y completa; 
no está empleado en ciertas entidades o instituciones financieras que involucren activos subyacentes u otros derivados; 
nuestra evaluación se basa en la información proporcionada por usted, y no somos responsables de daños o pérdidas derivadas de cualquier inexactitud; 
utiliza nuestros Servicios únicamente para beneficio personal; 
sus acciones bajo estos Términos y Condiciones cumplen con todas las leyes y regulaciones pertinentes; 
los fondos utilizados a través de Unique 1 Global no provienen de actividades ilegales como el tráfico de drogas, el terrorismo o cualquier acto delictivo; 
no despliega código o herramientas maliciosas con el objetivo de manipular nuestra Plataforma o Servicios; 
no está sujeto a sanciones financieras; 
su uso de nuestros Servicios se adhiere a los principios de honestidad, equidad y buena fe. 
El incumplimiento de cualquier garantía o representación en estos Términos y Condiciones puede llevar al cierre de órdenes o transacciones realizadas por usted. Además, nos reservamos el derecho de congelar o cerrar su cuenta. 

 

19. Derechos de propiedad intelectual 

19.1. Unique 1 Global reconoce y respeta los derechos de propiedad intelectual. Todo el contenido, incluidos pero no limitados a logotipos, marcas registradas, diseños, textos, gráficos, software y cualquier otro material presentado en la Plataforma, está protegido por las leyes de propiedad intelectual y sigue siendo propiedad exclusiva de Unique 1 Global o sus licenciantes. A los usuarios se les otorgan derechos limitados, intransferibles y no exclusivos para acceder y usar la Plataforma únicamente para fines personales y no comerciales. Cualquier reproducción, distribución, modificación o uso no autorizado del contenido de la Plataforma sin el consentimiento explícito de Unique 1 Global puede resultar en acciones legales y la aplicación de derechos de propiedad intelectual. 

19.2. Sin el consentimiento previo por escrito de la Plataforma o de otros titulares de derechos, ningún individuo está autorizado a modificar, copiar, distribuir, difundir públicamente, alterar o explotar comercialmente el programa o contenido de la Plataforma. Se prohíbe a los usuarios descargar o modificar la Plataforma o cualquier parte de la misma sin el consentimiento explícito por escrito. Además, el uso comercial, la reventa, la creación de derivados o la recopilación de datos de la Plataforma con fines comerciales está estrictamente prohibido sin autorización. 

19.3. Copiar, duplicar, vender o acceder al sitio web de la Plataforma o a cualquier parte del mismo con fines comerciales sin el consentimiento explícito por escrito está prohibido. No se permite a los usuarios utilizar ningún medio para obtener marcas registradas, logotipos o información propietaria de la Plataforma sin consentimiento. El uso no autorizado del nombre de la Plataforma, sus marcas comerciales o la información de las empresas afiliadas resultará en la terminación de la licencia o permiso del usuario otorgado por la Plataforma. 

19.4. Iniciar sesión en la Plataforma o utilizar cualquier Servicio ofrecido por la Plataforma no implica la transferencia de derechos de propiedad intelectual de la Plataforma a los usuarios. Los usuarios están obligados a respetar los derechos de propiedad intelectual. En caso de infracción, los usuarios son responsables ante la Plataforma, indemnizando por cualquier daño ocasionado como resultado de dicha infracción. 

 

20. Confidencialidad 

20.1. En Unique 1 Global, respetamos la confidencialidad de su información personal y estamos comprometidos a proteger su privacidad. Entendemos la importancia de sus datos y tomamos todas las medidas necesarias para garantizar su seguridad. Tanto Unique 1 Global como los usuarios tienen una responsabilidad compartida para mantener la confidencialidad de la información compartida y las actividades realizadas en la Plataforma. 

20.2. El acceso a su información personal está limitado al personal autorizado dentro de Unique 1 Global y a los proveedores de servicios de terceros que están contratados para ayudar con las operaciones comerciales y están sujetos a estrictos acuerdos de confidencialidad. 

20.3. Para obtener información más detallada sobre cómo manejamos, protegemos y procesamos sus datos personales, consulte nuestra Política de Privacidad, que proporciona una visión general completa de nuestras prácticas de protección de datos, derechos de los usuarios y cómo cumplimos con los requisitos legales. 

 

21. Ley aplicable 

21.1. La Ley Aplicable para Unique 1 Global y todos los servicios asociados estará sujeta a la jurisdicción de Saint Lucia. Cualquier asunto legal, disputa o reclamación que surja del uso de los servicios de Unique 1 Global o de la interpretación de estos Términos y Condiciones estará exclusivamente regido por las leyes de Saint Lucia. 

21.2. Antes de recurrir a acciones legales, Unique 1 Global y los usuarios acuerdan hacer esfuerzos razonables para resolver cualquier disputa o desacuerdo de manera pacífica y amistosa. Los usuarios y Unique 1 Global intentarán resolver cualquier disputa mediante comunicación directa y negociación, con el objetivo de alcanzar una resolución mutuamente aceptable. 

21.3. Si la disputa no puede resolverse mediante negociación, las partes acuerdan que cualquier asunto legal no resuelto será resuelto exclusivamente por los tribunales competentes de Saint Lucia. Al utilizar los Servicios de Unique 1 Global, los usuarios consienten la jurisdicción exclusiva de estos tribunales y renuncian a cualquier objeción basada en el lugar o la jurisdicción de dichos procedimientos legales. 

 

22. Disposiciones varias 

22.1. Estos Términos y Condiciones, junto con cualquier documento y política disponible en la Plataforma, constituyen el acuerdo completo entre usted y Unique 1 Global con respecto a su uso de la Plataforma y los Servicios. 

22.2. Si alguna disposición de estos Términos y Condiciones es considerada inválida, ilegal o inaplicable por un tribunal competente, las disposiciones restantes permanecerán en pleno vigor y efecto. La disposición inválida será reemplazada por una disposición válida que refleje más de cerca la intención original. 

22.3. La falta de Unique 1 Global en hacer cumplir cualquier disposición de estos Términos y Condiciones no se considerará una renuncia a la futura ejecución de esa disposición o de cualquier otra disposición. Cualquier renuncia a los derechos bajo estos Términos y Condiciones solo será válida si está por escrito y firmada por un representante autorizado de Unique 1 Global. 

22.4. Unique 1 Global se reserva el derecho de ceder o transferir sus derechos y obligaciones bajo estos Términos y Condiciones, total o parcialmente, a cualquier tercero. No puede ceder o transferir sus derechos u obligaciones bajo estos Términos y Condiciones sin el consentimiento previo por escrito de Unique 1 Global. 

22.5. Unique 1 Global no será responsable de ninguna falla o retraso en el cumplimiento de sus obligaciones bajo estos Términos y Condiciones si dicha falla o retraso es causado por eventos fuera de su control razonable, incluyendo, pero no limitado a, desastres naturales, fallos técnicos, acciones gubernamentales, disputas laborales o actos de guerra. 

22.6. Nada en estos Términos y Condiciones se interpretará como la creación de una sociedad, empresa conjunta o relación de agencia entre usted y Unique 1 Global. Nada en estos Términos y Condiciones se considerará como otorgar a una de las partes el derecho de actuar en nombre de o vincular a la otra parte. 

22.7. Los encabezados utilizados en estos Términos y Condiciones son solo para fines de referencia y no afectarán la interpretación o el significado de ninguna disposición. Se incluyen únicamente para la conveniencia del lector. 

22.8. Estos Términos y Condiciones, originalmente redactados en inglés, serán la versión de referencia para todas las interpretaciones y disputas. Si se proporcionan traducciones de estos Términos en cualquier otro idioma, la versión en inglés prevalecerá en caso de conflicto. 

 

23. Cambios a estos Términos y Condiciones 

23.1. Unique 1 Global se reserva el derecho de actualizar o modificar estos Términos y Condiciones en respuesta a cambios en las regulaciones, nuestros Servicios o prácticas comerciales. Cuando realicemos actualizaciones, revisaremos la fecha de vigencia en la parte superior de este documento. 

23.2. Le notificaremos de cualquier cambio material en estos Términos y Condiciones por correo electrónico u otros métodos de comunicación según corresponda. Si hacemos actualizaciones significativas, también podemos publicar un aviso en nuestra Plataforma para asegurarnos de que esté al tanto de los cambios. Es importante revisar estos Términos y Condiciones periódicamente para mantenerse informado sobre cómo estamos protegiendo sus datos personales. 

 

24. Información de contacto 

Si tiene alguna consulta, necesita asistencia o tiene preocupaciones sobre los Servicios de Unique 1 Global, estamos aquí para ayudarle. 

Puede contactarnos a través de los siguientes métodos: 

Teléfono: +371 254 93 902 
Email: support@uniqueoneglobal.com 
Dirección operativa: 32CV+6P5, planta baja, edificio Sotheby, Rodney Village, Rodney Bay, Gros-Islet, Rodney Bay, Santa Lucía 
Estamos dedicados a ofrecer un soporte eficiente y confiable para abordar sus preguntas o inquietudes. Ya sea que necesite soporte técnico, asistencia con su cuenta o información general, estamos disponibles y comprometidos a garantizar que su experiencia con Unique 1 Global sea fluida. 

________________________________________________________________________________________________________________________________________________________________ 

 

Reclamaciones de clientes 

 

Estimado cliente de Unique 1 Global, 

 

Si tienes objeciones o no estás satisfecho con nuestros servicios, con una transacción reciente de entrada o salida, o con cualquier otra cosa de la plataforma, te rogamos que nos envíes una queja a través de este formulario: 

 

Proporciona la siguiente información para facilitar la tramitación de las reclamaciones: 

 

Tu número de cuenta de operaciones (que encontrarás en su correo electrónico de bienvenida o en tu cuenta) 
Nombre, apellidos y dirección de correo electrónico con la que se registró la cuenta Unique 1 Global 
Fecha del problema 
Tema de su reclamación (por ejemplo, problema de depósito, comisión calculada incorrectamente, problema relacionado con la trading) 
Motivo y descripción de su reclamación (explíquelo detalladamente) 
 

Por favor, utiliza este email para enviar tu queja: support@uniqueoneglobal.com. Envía el formulario de reclamación y nuestro equipo te responderá en un plazo de cinco días laborables. 
`;

// --- Renderizador de Markdown simple ---
// Adaptamos el contenido markdown a HTML para renderizarlo
const MarkdownRenderer = ({ content }) => {
  const processMarkdown = (markdown) => {
    let html = markdown;

    // 1. Preprocesamiento de saltos de línea para manejo de párrafos
    html = html.replace(/\n\s*\n/g, "<!-- PARAGRAPH BREAK -->");
    html = html.replace(/\n/g, " ");
    html = html.replace(/<!-- PARAGRAPH BREAK -->/g, "\n\n");

    // 2. Encabezados (H1 y H2)
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-2xl font-bold mt-6 mb-3 text-gray-900">$1</h2>'
    );
    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="text-3xl font-extrabold mb-5 text-purple-600">$1</h1>'
    );

    // 3. Listas (Básico)
    html = html.replace(/^\* (.*$)/gim, "<li>$1</li>");
    if (html.includes("<li>")) {
      // Unir elementos <li> consecutivos
      html = html.replace(/<\/li>\s*<li>/g, "</li><li>");
      // Envolver los bloques de <li> en <ul>
      html = html.replace(/([^>]*)<li>/g, "$1<ul><li>");
      html = html.replace(/<\/li>([^<]*$|[^<]*<h)/g, "</li></ul>$1");

      // Limpieza final de la lista
      html = html.replace(/<ul>(.*?)<\/ul>/gs, (match, content) => {
        // Eliminar cualquier etiqueta de párrafo residual dentro de la lista
        content = content.replace(/<p[^>]*>/g, "").replace(/<\/p>/g, "");
        return `<ul class="list-disc ml-6 space-y-1 mb-4">${content}</ul>`;
      });
    }

    // 4. Tablas (Específico para el formato de la política)
    const tableRegex =
      /\|\s*([^|]*)\s*\|\s*([^|]*)\s*\|\s*([^|]*)\s*\|\n(?:\|[-:]+\s*\|[-:]+\s*\|[-:]+\s*\|\n)((\s*\|.*\|.*\|.*\|\n?)*)/gi;
    html = html.replace(
      tableRegex,
      (match, header1, header2, header3, rows) => {
        let tableHtml = `<table class="min-w-full divide-y divide-gray-300 rounded-lg overflow-hidden shadow-md my-4">
                        <thead class="bg-purple-100">
                          <tr>
                            <th class="px-4 py-2 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">${header1.trim()}</th>
                            <th class="px-4 py-2 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">${header2.trim()}</th>
                            <th class="px-4 py-2 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">${header3.trim()}</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200 text-sm text-gray-700">`;
        // Filtrar y procesar solo filas de datos
        const rowLines = rows
          .trim()
          .split("\n")
          .filter((line) => line.trim().startsWith("|"));
        rowLines.forEach((line) => {
          const columns = line
            .split("|")
            .map((col) => col.trim())
            .filter((col) => col.length > 0);
          if (columns.length === 3) {
            tableHtml += `<tr>
                          <td class="px-4 py-2 whitespace-nowrap">${columns[0]}</td>
                          <td class="px-4 py-2">${columns[1]}</td>
                          <td class="px-4 py-2">${columns[2]}</td>
                        </tr>`;
          }
        });
        tableHtml += `</tbody></table>`;
        return tableHtml;
      }
    );

    // 5. Énfasis (Negrita)
    html = html.replace(
      /\*\*(.*?)\*\*/gim,
      '<strong class="font-extrabold text-red-600">$1</strong>'
    );
    html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");

    // 6. Párrafos (Aplica solo a bloques de texto que NO son HTML)
    html = html
      .split("\n\n")
      .map((block) => {
        block = block.trim();
        // Evitar envolver bloques que ya son HTML o ya han sido procesados
        if (
          block.length > 0 &&
          !block.startsWith("<h") &&
          !block.startsWith("<ul") &&
          !block.startsWith("<table") &&
          !block.startsWith("<p") &&
          !block.startsWith("___")
        ) {
          return `<p class="text-gray-700 mb-4 leading-relaxed">${block}</p>`;
        }
        return block;
      })
      .join("");

    return html;
  };

  const cleanContent = processMarkdown(content);

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};

// --- Configuración de Axios ---
axios.defaults.baseURL = VITE_API_URL;
axios.defaults.withCredentials = true;

// --- Registro de Chart.js ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

// --- Iconos SVG ---
const Icon = ({ path, className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const Icons = {
  Menu: () => <Icon path="M4 6h16M4 12h16M4 18h16" className="h-6 w-6" />,
  Bell: ({ className }) => (
    <Icon
      path="M14.857 17.082a23.848 23.848 0 005.454-1.331 8.967 8.967 0 01-4.436-5.334m4.436 5.334a23.848 23.848 0 01-5.454 1.331m0 0a2.38 2.38 0 01-1.872 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      className={className}
    />
  ),
  Plus: () => <Icon path="M12 4v16m8-8H4" className="h-4 w-4" />,
  UserGroup: ({ className }) => (
    <Icon
      path="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
      className={className}
    />
  ),
  Logout: ({ className }) => (
    <Icon
      path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      className={className}
    />
  ),
  Bell: ({ className }) => (
    <Icon
      path="M14.857 17.082a23.848 23.848 0 005.454-1.331 8.967 8.967 0 01-4.436-5.334m4.436 5.334a23.848 23.848 0 01-5.454 1.331m0 0a2.38 2.38 0 01-1.872 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      className={className}
    />
  ),
  X: ({ className = "h-6 w-6" }) => (
    <Icon path="M6 18L18 6M6 6l12 12" className={className} />
  ),
  ViewList: () => (
    <Icon path="M4 6h16M4 10h16M4 14h16M4 18h16" className="h-4 w-4" />
  ),
  Key: ({ className }) => (
    <Icon
      path="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a4 4 0 100 8 4 4 0 000-8z"
      className={className}
    />
  ),
  UserCircle: ({ className }) => (
    <Icon
      path="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
      className={className}
    />
  ),
  ChevronLeft: () => <Icon path="M15 19l-7-7 7-7" className="h-5 w-5 mr-2" />,
  ArrowDownTray: ({ className }) => (
    <Icon
      path="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
      className={className}
    />
  ),
  ArrowUpTray: ({ className }) => (
    <Icon
      path="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
      className={className}
    />
  ),
  Clipboard: ({ className }) => (
    <Icon
      path="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.043m-7.416 0v3.043c0 .212.03.418.084.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
      className={className}
    />
  ),
  Banknotes: ({ className }) => (
    <Icon
      path="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0 .75-.75V9.75M15 13.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      className={className}
    />
  ),
  CreditCard: ({ className }) => (
    <Icon
      path="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z"
      className={className}
    />
  ),
  ShieldCheck: ({ className }) => (
    <Icon
      path="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm-1.12 8.149a.75.75 0 1 0-1.06 1.06l2.12 2.12a.75.75 0 0 0 1.06 0l4.243-4.242a.75.75 0 0 0-1.06-1.06l-3.713 3.713-1.59-1.59Z"
      className={className}
    />
  ),
  Adjustments: ({ className }) => (
    <Icon
      path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM12 15a3 3 0 100-6 3 3 0 000 6z"
      className={className}
    />
  ),
  ArrowRight: ({ className }) => (
    <Icon path="M17 8l4 4m0 0l-4-4m4-4H3" className={className} />
  ),
  CurrencyDollar: ({ className }) => (
    <Icon
      path="M12 6v12M12 6c-2.828 0-4.5 1.172-4.5 4.5S9.172 15 12 15s4.5-1.172 4.5-4.5S14.828 6 12 6ZM12 6c2.828 0 4.5 1.172 4.5 4.5S14.828 15 12 15s-4.5-1.172-4.5-4.5S9.172 6 12 6Z"
      className={className}
    />
  ),
};

// --- Función de Normalización Clave para el Precio ---
// Esta función debe coincidir con la lógica del backend (server.js: normalizeSymbol)
const normalizeAssetKey = (symbol) => {
  if (!symbol) return "";
  // Reemplaza '-' y '/' para obtener el formato de clave de precio (ej: BTCUSDT o EURUSD)
  return symbol.toUpperCase().replace(/[-/]/g, "");
};

// --- Catálogo de Activos ---
// Este catálogo es la fuente principal de activos para la UI.
const ASSET_CATALOG = [
  // Forex
  { symbol: "EUR/USD", name: "Euro / Dólar Estadounidense" },
  { symbol: "GBP/USD", name: "Libra Esterlina / Dólar Estadounidense" },
  { symbol: "EUR/JPY", name: "Euro / Yen Japonés" },
  { symbol: "USD/JPY", name: "Dólar Estadounidense / Yen Japonés" },
  { symbol: "AUD/USD", name: "Dólar Australiano / Dólar Estadounidense" },
  { symbol: "USD/CHF", name: "Dólar Estadounidense / Franco Suizo" },
  { symbol: "GBP/JPY", name: "Libra Esterlina / Yen Japonés" },
  { symbol: "USD/CAD", name: "Dólar Estadounidense / Dólar Canadiense" },
  { symbol: "EUR/GBP", name: "Euro / Libra Esterlina" },
  { symbol: "EUR/CHF", name: "Euro / Franco Suizo" },
  { symbol: "AUD/JPY", name: "Dólar Australiano / Yen Japonés" },
  { symbol: "NZD/USD", name: "Dólar Neozelandés / Dólar Estadounidense" },
  { symbol: "CHF/JPY", name: "Franco Suizo / Yen Japonés" },
  { symbol: "EUR/AUD", name: "Euro / Dólar Australiano" },
  { symbol: "CAD/JPY", name: "Dólar Canadiense / Yen Japonés" },
  { symbol: "GBP/AUD", name: "Libra Esterlina / Dólar Australiano" },
  { symbol: "EUR/CAD", name: "Euro / Dólar Canadiense" },
  { symbol: "AUD/CAD", name: "Dólar Australiano / Dólar Canadiense" },
  { symbol: "GBP/CAD", name: "Libra Esterlina / Dólar Canadiense" },
  { symbol: "AUD/NZD", name: "Dólar Australiano / Dólar Neozelandés" },
  { symbol: "NZD/JPY", name: "Dólar Neozelandés / Yen Japonés" },
  { symbol: "AUD/CHF", name: "Dólar Australiano / Franco Suizo" },
  { symbol: "USD/MXN", name: "Dólar Estadounidense / Peso Mexicano" },
  { symbol: "GBP/NZD", name: "Libra Esterlina / Dólar Neozelandés" },
  { symbol: "EUR/NZD", name: "Euro / Dólar Neozelandés" },
  { symbol: "CAD/CHF", name: "Dólar Canadiense / Franco Suizo" },
  { symbol: "NZD/CAD", name: "Dólar Neozelandés / Dólar Canadiense" },
  { symbol: "NZD/CHF", name: "Dólar Neozelandés / Franco Suizo" },
  { symbol: "GBP/CHF", name: "Libra Esterlina / Franco Suizo" },
  { symbol: "USD/BRL", name: "Dólar Estadounidense / Real Brasileño" },

  // Commodities
  { symbol: "XAU/USD", name: "Oro (Gold)" },
  { symbol: "XAG/USD", name: "Plata (Silver)" },
  { symbol: "WTI/USD", name: "Petróleo Crudo WTI" },
  { symbol: "BRENT/USD", name: "Petróleo Crudo Brent" }, // Normalizado de BRN/USD
  { symbol: "XCU/USD", name: "Cobre (Copper)" },
  { symbol: "NG/USD", name: "Gas Natural" }, // Normalizado de NGC/USD

  // Criptomonedas (normalizadas a -USDT para compatibilidad con el feed)
  { symbol: "BTC-USDT", name: "Bitcoin" },
  { symbol: "ETH-USDT", name: "Ethereum" },
  { symbol: "LTC-USDT", name: "Litecoin" },
  { symbol: "XRP-USDT", name: "Ripple" },
  { symbol: "BNB-USDT", name: "BNB" },
  { symbol: "TRX-USDT", name: "TRON" },
  { symbol: "ADA-USDT", name: "Cardano" },
  { symbol: "DOGE-USDT", name: "Dogecoin" },
  { symbol: "SOL-USDT", name: "Solana" },
  { symbol: "DOT-USDT", name: "Polkadot" },
  { symbol: "LINK-USDT", name: "Chainlink" },
  { symbol: "MATIC-USDT", name: "Polygon (MATIC)" }, // Normalizado de POL/USD
  { symbol: "AVAX-USDT", name: "Avalanche" },
  { symbol: "PEPE-USDT", name: "Pepe" },
  { symbol: "SUI-USDT", name: "Sui" },
  { symbol: "TON-USDT", name: "Toncoin" },

  // Indices
  { symbol: "DAX", name: "DAX 40 (Alemania)" },
  { symbol: "FCHI", name: "CAC 40 (Francia)" },
  { symbol: "FTSE", name: "FTSE 100 (Reino Unido)" },
  { symbol: "SX5E", name: "EURO STOXX 50" },
  { symbol: "IBEX", name: "IBEX 35 (España)" },
  { symbol: "DJI", name: "Dow Jones Industrial Average" },
  { symbol: "SPX", name: "S&P 500" },
  { symbol: "NDX", name: "Nasdaq 100" },
  { symbol: "NI225", name: "Nikkei 225" },

  // Acciones
  { symbol: "META", name: "Meta Platforms, Inc." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "KO", name: "The Coca-Cola Company" },
  { symbol: "MA", name: "Mastercard Incorporated" },
  { symbol: "IBM", name: "IBM" },
  { symbol: "DIS", name: "The Walt Disney Company" },
  { symbol: "CVX", name: "Chevron Corporation" },
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
  { symbol: "BA", name: "The Boeing Company" },
  { symbol: "BAC", name: "Bank of America Corp" },
  { symbol: "CSCO", name: "Cisco Systems, Inc." },
  { symbol: "MCD", name: "McDonald's Corporation" },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "NFLX", name: "Netflix, Inc." },
  { symbol: "NKE", name: "NIKE, Inc." }, // Normalizado de NIKE
  { symbol: "ORCL", name: "Oracle Corporation" },
  { symbol: "PG", name: "Procter & Gamble Company" },
  { symbol: "T", name: "AT&T Inc." },
  { symbol: "TSLA", name: "Tesla, Inc." },
];

const POPULAR_ASSETS = [
  ASSET_CATALOG.find((a) => a.symbol === "BTC-USDT"),
  ASSET_CATALOG.find((a) => a.symbol === "EUR/USD"),
  ASSET_CATALOG.find((a) => a.symbol === "XAU/USD"),
  ASSET_CATALOG.find((a) => a.symbol === "AAPL"),
  ASSET_CATALOG.find((a) => a.symbol === "TSLA"),
  ASSET_CATALOG.find((a) => a.symbol === "NVDA"),
].filter(Boolean); // Filter out any potential undefined if symbols change

// --- Contexto de la App ---
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [realTimePrices, setRealTimePrices] = useState({});
  const [selectedAsset, setSelectedAsset] = useState("BTC-USDT");
  // ACTUALIZADO: Estado para las comisiones, spreads y swap
  const [commissions, setCommissions] = useState({
    spreadPercentage: 0.01,
    commissionPercentage: 0.1,
    swapDailyPercentage: 0.05, // AÑADIDO: Swap diario por defecto
  });
  const [globalNotification, setGlobalNotification] = useState(null);
  const checkUser = useCallback(async () => {
    setIsAppLoading(true);
    try {
      const { data } = await axios.get("/me");
      setUser(data);
      setIsAuthenticated(true);

      // Intentar cargar comisiones si es administrador o usuario regular
      if (data) {
        try {
          const commRes = await axios.get("/commissions");
          setCommissions(commRes.data);
        } catch (e) {
          console.warn("Failed to fetch commissions, using defaults.");
        }
      }
    } catch (error) {
      console.log("No authenticated user found.");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsAppLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const logout = useCallback(async () => {
    try {
      await axios.post("/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      isAppLoading,
      logout,
      realTimePrices,
      setRealTimePrices,
      selectedAsset,
      setSelectedAsset,
      refreshUser: checkUser,
      commissions, // Exponer comisiones
      setCommissions, // Exponer setCommissions
      globalNotification, // AÑADIDO
      setGlobalNotification, // AÑADIDO
    }),
    [
      user,
      isAuthenticated,
      isAppLoading,
      logout,
      realTimePrices,
      selectedAsset,
      checkUser,
      commissions,
      globalNotification, // AÑADIDO
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Hooks y Componentes de UI ---
const useFlashOnUpdate = (value) => {
  const [flashClass, setFlashClass] = useState("");
  const prevValueRef = useRef(value);

  useEffect(() => {
    // CRÍTICO: Asegurar que el valor sea un número antes de la comparación
    const currentValue = parseFloat(value);
    const prevValue = parseFloat(prevValueRef.current);

    if (
      !isNaN(currentValue) &&
      !isNaN(prevValue) &&
      currentValue !== prevValue
    ) {
      setFlashClass(
        currentValue > prevValue ? "text-green-500" : "text-red-500"
      );
      const timer = setTimeout(() => setFlashClass(""), 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  useEffect(() => {
    prevValueRef.current = value;
  });

  return flashClass;
};

const Toast = ({ message, type, onDismiss }) => (
  <motion.div
    layout
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg shadow-2xl text-white text-sm flex items-center border ${
      type === "success"
        ? "bg-green-500/90 border-green-400"
        : "bg-red-500/90 border-red-400"
    }`}
  >
    <p>{message}</p>
    <button
      onClick={onDismiss}
      className="ml-4 text-white/70 hover:text-white cursor-pointer"
    >
      &times;
    </button>
  </motion.div>
);

const Card = React.forwardRef(({ children, className = "", ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-white p-4 rounded-xl border border-gray-200 shadow-md ${className}`}
    {...props}
  >
    {children}
  </motion.div>
));

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const TradingViewWidget = React.memo(({ symbol }) => {
  const containerRef = useRef(null);

  const getTradingViewSymbol = useCallback((assetSymbol) => {
    if (!assetSymbol) return "KUCOIN:BTCUSDT";
    let s = assetSymbol.toUpperCase();

    if (s.includes("-USDT")) return `KUCOIN:${s.replace("-", "")}`;
    if (s.endsWith("USDT")) return `KUCOIN:${s}`;
    if (s === "WTI/USD") return "TVC:USOIL";
    if (s === "BRENT/USD") return "TVC:UKOIL";
    if (s === "XAU/USD") return "OANDA:XAUUSD";
    if (s === "XAG/USD") return "OANDA:XAGUSD";

    if (s.includes("/")) {
      const sanitizedSymbol = s.replace("/", "");
      const forexPairs = [
        "EURUSD",
        "USDJPY",
        "GBPUSD",
        "AUDUSD",
        "USDCAD",
        "USDCHF",
        "NZDUSD",
        "EURJPY",
        "GBPJPY",
        "AUDJPY",
        "CADJPY",
        "CHFJPY",
        "NZDJPY",
        "EURGBP",
        "EURAUD",
        "EURCAD",
        "EURCHF",
        "EURNZD",
        "GBPAUD",
        "GBPCAD",
        "GBPCHF",
        "GBPNZD",
        "AUDCAD",
        "AUDCHF",
        "AUDNZD",
        "CADCHF",
        "NZDCAD",
        "NZDCHF",
        "USDMXN",
        "USDBRL",
      ];
      if (forexPairs.includes(sanitizedSymbol)) {
        return `OANDA:${sanitizedSymbol}`;
      }
    }
    // Mapeo de índices a sus símbolos en TradingView
    const indicesMap = {
      DAX: "DEU40",
      FCHI: "FRA40",
      FTSE: "UK100",
      SX5E: "STOXX50",
      IBEX: "ESP35",
      DJI: "US30",
      SPX: "SPX500",
      NDX: "NAS100",
      NI225: "JPN225",
    };
    if (indicesMap[s]) return `OANDA:${indicesMap[s]}`;

    return `NASDAQ:${s}`;
  }, []);

  useEffect(() => {
    const tvSymbol = getTradingViewSymbol(symbol);
    let widget = null;

    const createWidget = () => {
      if (!containerRef.current || typeof window.TradingView === "undefined")
        return;
      containerRef.current.innerHTML = "";
      widget = new window.TradingView.widget({
        autosize: true,
        symbol: tvSymbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "light",
        style: "1",
        locale: "es",
        enable_publishing: false,
        hide_side_toolbar: true,
        hide_top_toolbar: false,
        allow_symbol_change: false,
        container_id: containerRef.current.id,
      });
    };

    if (!document.getElementById("tradingview-script")) {
      const script = document.createElement("script");
      script.id = "tradingview-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = createWidget;
      document.body.appendChild(script);
    } else {
      createWidget();
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, getTradingViewSymbol]);

  return (
    <div
      id="tradingview-widget-container"
      ref={containerRef}
      className="h-full w-full"
    />
  );
});

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };
  return (
    <div className="flex justify-center items-center gap-2 mt-2">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors text-xs"
      >
        Anterior
      </button>
      <span className="text-gray-500 text-xs">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors text-xs"
      >
        Siguiente
      </button>
    </div>
  );
};

const PerformanceChart = ({ performanceData, isLoading }) => {
  const chartData = useMemo(
    () => ({
      labels: performanceData.map((d) =>
        new Date(d.fecha).toLocaleDateString()
      ),
      datasets: [
        {
          label: "Ganancia Diaria",
          data: performanceData.map((d) => parseFloat(d.ganancia_dia || 0)),
          fill: true,
          backgroundColor: "rgba(65, 0, 147, 0.2)",
          borderColor: "#410093",
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    }),
    [performanceData]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { display: false }, y: { display: false } },
      plugins: { legend: { display: false } },
    }),
    []
  );

  return (
    <Card className="mt-4">
      <h3 className="text-gray-900 font-bold text-base mb-4">Rendimiento</h3>
      <div className="h-28">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : !performanceData || performanceData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-xs">
            No hay datos de rendimiento
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </Card>
  );
};

const StatisticsPanel = ({ stats, performanceData, isLoading }) => (
  <div className="mt-6 space-y-4">
    <Card>
      <h3 className="text-gray-900 font-bold text-base mb-4">Métricas de Crédito</h3>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-5" /> <Skeleton className="h-5" />
          <Skeleton className="h-5" /> <Skeleton className="h-5" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 text-gray-600 text-sm">
          <div>
            Crédito Total:{" "}
            <span className="font-semibold text-green-600">
              ${parseFloat(stats.credito || 0).toFixed(2)}
            </span>
          </div>
          <div>
            Crédito Usado:{" "}
            <span className="font-bold text-orange-600">
              ${parseFloat(stats.credito_usado || 0).toFixed(2)}
            </span>
          </div>
          <div>
            Interés Acum.:{" "}
            <span className="font-semibold text-red-600">
              ${parseFloat(stats.interes_acumulado || 0).toFixed(2)}
            </span>
          </div>
          <div>
             Tasa Interés:{" "}
             <span className="font-semibold text-gray-900">
              {stats.tasa_interes || 0}%
             </span>
          </div>
        </div>
      )}
    </Card>
    <PerformanceChart performanceData={performanceData} isLoading={isLoading} />
  </div>
);

const AssetPrice = React.memo(({ symbol }) => {
  const { realTimePrices } = useContext(AppContext);
  // FIX CRÍTICO: Usar la función de normalización clave
  const normalizedSymbol = normalizeAssetKey(symbol);
  const priceString = realTimePrices[normalizedSymbol];

  // FIX: Convertir explícitamente a número y manejar NaN
  const price = parseFloat(priceString);

  const flashClass = useFlashOnUpdate(price);
  const baseColor = !isNaN(price) ? "text-gray-800" : "text-gray-400";
  const finalColorClass = flashClass || baseColor;

  return (
    <div className="px-2 py-1 rounded-md">
      <span
        className={`font-mono text-xs transition-colors duration-300 ${finalColorClass}`}
      >
        {!isNaN(price) ? price.toFixed(4) : "---"}
      </span>
    </div>
  );
});

const AssetRow = React.memo(({ symbol, isSelected, onClick, onRemove }) => (
  <motion.li
    layout
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(symbol)}
    className={`cursor-pointer transition-all duration-200 rounded-md flex justify-between items-center p-2 group ${
      isSelected
        ? "bg-purple-100 text-purple-800"
        : "hover:bg-gray-100 text-gray-700"
    }`}
  >
    <span className="font-semibold">{symbol}</span>
    <div className="flex items-center gap-2">
      <AssetPrice symbol={symbol} />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(symbol);
        }}
        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        title={`Eliminar ${symbol}`}
      >
        <Icons.X className="h-4 w-4" />
      </button>
    </div>
  </motion.li>
));

const AssetLists = React.memo(({ assets, onAddAsset, onRemoveAsset }) => {
  const { setSelectedAsset, selectedAsset } = useContext(AppContext);
  const [inputValue, setInputValue] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSuggestionVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFocus = () => {
    if (!inputValue) {
      setRecommendations(POPULAR_ASSETS);
    }
    setIsSuggestionVisible(true);
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setInputValue(value);
    if (value) {
      const filtered = ASSET_CATALOG.filter(
        (asset) =>
          asset.symbol.toUpperCase().includes(value) ||
          asset.name.toUpperCase().includes(value)
      );
      setRecommendations(filtered);
    } else {
      setRecommendations(POPULAR_ASSETS);
    }
  };

  const handleRecommendationClick = (symbol) => {
    setInputValue(symbol);
    setIsSuggestionVisible(false);
  };

  const handleAssetClick = useCallback(
    (symbol) => {
      setSelectedAsset(symbol);
    },
    [setSelectedAsset]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue) {
      // Find the correct symbol even if the user searched by name
      const assetToUse =
        ASSET_CATALOG.find(
          (asset) =>
            asset.symbol.toUpperCase() === inputValue.toUpperCase() ||
            asset.name.toUpperCase() === inputValue.toUpperCase()
        )?.symbol || inputValue.toUpperCase();

      onAddAsset(assetToUse);
      setInputValue("");
      setIsSuggestionVisible(false);
    }
  };

  return (
    <div className="mb-6">
      <div ref={searchContainerRef} className="relative">
        <form onSubmit={handleSubmit} className="mb-1 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder="Ej: Amazon, AMZN"
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded transition-colors flex-shrink-0 cursor-pointer"
            style={{ backgroundColor: "#410093" }}
          >
            <Icons.Plus />
          </button>
        </form>
        {isSuggestionVisible && recommendations.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute w-full bg-white border border-gray-200 rounded-md mt-1 max-h-48 overflow-y-auto z-20 shadow-lg"
          >
            {recommendations.map((rec) => (
              <li
                key={rec.symbol}
                onClick={() => handleRecommendationClick(rec.symbol)}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-purple-500 hover:text-white cursor-pointer flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold">{rec.symbol}</span>
                  <span className="ml-2 text-gray-500 text-xs">{rec.name}</span>
                </div>
                <AssetPrice symbol={rec.symbol} />
              </li>
            ))}
          </motion.ul>
        )}
      </div>
      <h2 className="text-gray-500 font-bold text-sm tracking-wider uppercase mt-4 mb-3 px-2">
        Mis Activos
      </h2>
      <ul className="space-y-1 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {assets.map((symbol) => (
            <AssetRow
              key={symbol}
              symbol={symbol}
              isSelected={selectedAsset === symbol}
              onClick={handleAssetClick}
              onRemove={onRemoveAsset}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
});

const MenuItem = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
  >
    {icon}
    <span className="ml-3">{text}</span>
  </button>
);

const ProfileMenu = React.memo(
  ({
    user,
    logout,
    onToggleSideMenu,
    onManageUsers,
    onManageLeverage,
    onManageCommissions, // NUEVA prop
    onOpenProfileModal,
    onManageNotifications,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target))
          setIsOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleItemClick = (action) => {
      if (action) action();
      setIsOpen(false);
    };

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-100 cursor-pointer text-gray-600 p-2 rounded-full hover:bg-purple-500 hover:text-white transition-colors"
          title="Cuenta"
        >
          <Icons.UserCircle className="h-6 w-6" />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-white ring-1 ring-gray-200 focus:outline-none z-50 p-2 border border-gray-200"
            >
              <div className="px-3 py-2 border-b border-gray-200 mb-2">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.nombre || "Usuario"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "email@example.com"}
                </p>
              </div>
              <div className="space-y-1">
                <MenuItem
                  icon={<Icons.UserCircle className="h-5 w-5 text-gray-500" />}
                  text="Ver Perfil"
                  onClick={() => handleItemClick(onOpenProfileModal)}
                />
                <MenuItem
                  icon={<Icons.UserCircle className="h-5 w-5 text-gray-500" />}
                  text="Gestionar Cuenta"
                  onClick={() => handleItemClick(onToggleSideMenu)}
                />

                {user?.rol === "admin" && (
                  <>
                    <MenuItem
                      icon={
                        <Icons.UserGroup className="h-5 w-5 text-gray-500" />
                      }
                      text="Gestionar Usuarios"
                      onClick={() => handleItemClick(onManageUsers)}
                    />
                    <MenuItem
                      icon={
                        <Icons.Adjustments className="h-5 w-5 text-gray-500" />
                      }
                      text="Gestionar Apalancamiento"
                      onClick={() => handleItemClick(onManageLeverage)}
                    />
                    {/* NUEVO ITEM DE MENÚ PARA COMISIONES */}
                    <MenuItem
                      icon={
                        <Icons.CurrencyDollar className="h-5 w-5 text-gray-500" />
                      }
                      text="Gestionar Comisiones"
                      onClick={() => handleItemClick(onManageCommissions)}
                    />
                    <MenuItem
                      icon={<Icons.Bell className="h-5 w-5 text-red-500" />}
                      text="Enviar Notificación"
                      onClick={() => handleItemClick(onManageNotifications)}
                    />
                  </>
                )}
                <div className="my-1 h-px bg-gray-200" />
                <MenuItem
                  icon={
                    <Icons.Logout className="h-5 w-5 cursor-pointer text-purple-500" />
                  }
                  text="Cerrar Sesión"
                  onClick={() => handleItemClick(logout)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

const Header = ({
  onOperation,
  onManageUsers,
  onManageLeverage,
  onManageCommissions, // NUEVA prop
  onToggleSideMenu,
  onToggleMainSidebar,
  onOpenProfileModal,
  onManageNotifications,
}) => {
  const { user, logout, selectedAsset } = useContext(AppContext);
  const [volume, setVolume] = useState(0.01);

  return (
    <header className="flex justify-between items-center px-4 sm:px-6 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMainSidebar}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 lg:hidden"
        >
          <Icons.Menu />
        </button>
        <div className="hidden sm:flex items-center space-x-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onOperation("sell", volume)}
            className="bg-red-600 hover:bg-red-500 transition-all text-white px-5 py-2 text-sm font-bold rounded-md shadow-lg shadow-red-500/20 hover:shadow-red-500/40 cursor-pointer"
          >
            SELL
          </motion.button>
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
            step="0.01"
            min="0.01"
            className="w-24 p-2 border border-gray-300 bg-gray-50 rounded-md text-gray-900 text-center text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onOperation("buy", volume)}
            className="bg-green-600 hover:bg-green-500 transition-all text-white px-5 py-2 text-sm font-bold rounded-md shadow-lg shadow-green-500/20 hover:shadow-green-500/40 cursor-pointer"
            style={{ backgroundColor: "#02D13D" }}
          >
            BUY
          </motion.button>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
          {selectedAsset}
        </h2>
        <p className="text-xs text-gray-500 hidden sm:block">
          Activo para operar
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <ProfileMenu
          user={user}
          logout={logout}
          onToggleSideMenu={onToggleSideMenu}
          onManageUsers={onManageUsers}
          onManageLeverage={onManageLeverage}
          onManageCommissions={onManageCommissions} // Pasa el nuevo handler
          onManageNotifications={onManageNotifications}
          onOpenProfileModal={onOpenProfileModal}
        />
      </div>
    </header>
  );
};

const FlashingMetric = ({ value, prefix = "", suffix = "" }) => {
  const flashClass = useFlashOnUpdate(value);
  const baseColor = "text-gray-900";
  const finalColorClass = flashClass || baseColor;
  return (
    <span
      className={`font-bold px-2 py-1 rounded-md transition-colors duration-300 ${finalColorClass}`}
    >
      {prefix}
      {!isNaN(parseFloat(value)) ? parseFloat(value).toFixed(2) : "0.00"}
      {suffix}
    </span>
  );
};

const FinancialMetrics = ({ metrics, isLoading }) => (
  <Card className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 justify-items-center p-3 text-xs sm:text-sm">
    {isLoading ? (
      Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))
    ) : (
      <>
        <div className="text-center p-2 w-full">
          <p className="text-gray-500">Balance</p>
          <span className="font-bold text-gray-900">${metrics.balance}</span>
        </div>
        <div className="text-center p-2 w-full">
          <p className="text-gray-500">Equidad</p>
          <FlashingMetric value={metrics.equity} prefix="$" />
        </div>

        <div className="text-center p-2 w-full">
          <p className="text-gray-500">M. Usado</p>
          <FlashingMetric value={metrics.usedMargin} prefix="$" />
        </div>
        <div className="text-center p-2 w-full">
          <p className="text-gray-500">M. Libre</p>
          <FlashingMetric value={metrics.freeMargin} prefix="$" />
        </div>
        <div className="text-center p-2 w-full col-span-2 sm:col-span-1 md:col-span-1">
          <p className="text-gray-500">Nivel Margen</p>
          <span
            className={`font-bold px-2 py-1 rounded-md transition-colors duration-300 ${
              parseFloat(metrics.marginLevel) > 200
                ? "text-green-600"
                : parseFloat(metrics.marginLevel) > 120
                ? "text-yellow-600"
                : parseFloat(metrics.marginLevel) > 0
                ? "text-red-600 animate-pulse"
                : "text-gray-400"
            }`}
          >
            {metrics.marginLevel}%
          </span>
        </div>
      </>
    )}
  </Card>
);

const LiveProfitCell = ({ operation }) => {
  const { realTimePrices } = useContext(AppContext);
  const calculateProfit = useCallback(() => {
    if (operation.cerrada) return parseFloat(operation.ganancia || 0);
    // FIX: Usar la función de normalización clave
    const normalizedSymbol = normalizeAssetKey(operation.activo);

    // FIX: Asegurar que el precio sea un número
    const currentPrice = parseFloat(realTimePrices[normalizedSymbol]);

    if (isNaN(currentPrice)) return 0;

    return operation.tipo_operacion.toLowerCase().includes("sell")
      ? (operation.precio_entrada - currentPrice) * operation.volumen
      : (currentPrice - operation.precio_entrada) * operation.volumen;
  }, [realTimePrices, operation]);

  // FIX: Asegurar que el resultado de calculateProfit sea un número para toFixed
  const profit = calculateProfit();
  const profitNum = parseFloat(profit);

  if (isNaN(profitNum)) return <span className="text-gray-400">---</span>;

  const profitColor = profitNum >= 0 ? "text-green-600" : "text-red-600";
  return (
    <span className={`font-mono ${profitColor}`}>{profitNum.toFixed(2)}</span>
  );
};

const OperationsHistory = ({
  operations,
  setOperations,
  filter,
  setFilter,
  onRowClick,
  isLoading,
  pagination,
  onPageChange,
  setAlert,
}) => {
  const handleCloseOperation = async (e, opId) => {
    e.stopPropagation();
    try {
      const { data } = await axios.post("/cerrar-operacion", {
        operacion_id: opId,
      });
      if (data.success) {
        setOperations((prevOps) =>
          prevOps.map((op) =>
            op.id === opId
              ? {
                  ...op,
                  cerrada: true,
                  ganancia: data.gananciaFinal,
                  precio_cierre: data.precio_cierre,
                }
              : op
          )
        );
        setAlert({ message: "Operación cerrada con éxito.", type: "success" });
      } else {
        setAlert({
          message: data.error || "No se pudo cerrar la operación.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error closing operation:", error);
      setAlert({
        message: "Error de red al cerrar la operación.",
        type: "error",
      });
    }
  };

  const columns = [
    "Fecha",
    "Tipo",
    "Volumen",
    "Activo",
    "Entrada",
    "Cierre",
    "TP",
    "SL",
    "Apalanc.",
    "Margen",
    "G-P",
    "Acción",
  ];
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }),
  };

  const renderMobileCard = (op, index) => (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card
        key={op.id}
        className="text-sm cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onRowClick(op)}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-lg text-gray-900">{op.activo}</span>
          <span
            className={`px-2 py-1 rounded-md text-xs font-bold ${
              op.tipo_operacion.toLowerCase().includes("buy")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {op.tipo_operacion}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-gray-700 mb-4">
          <div>
            <span className="font-semibold text-gray-500">Vol:</span>{" "}
            {op.volumen}
          </div>
          <div>
            <span className="font-semibold text-gray-500">Apalanc:</span> 1:
            {op.apalancamiento || 1}
          </div>
          <div>
            <span className="font-semibold text-gray-500">Entrada:</span>{" "}
            {parseFloat(op.precio_entrada).toFixed(4)}
          </div>
          <div>
            <span className="font-semibold text-gray-500">TP:</span>{" "}
            {op.take_profit ? parseFloat(op.take_profit).toFixed(2) : "-"}
          </div>
          <div>
            <span className="font-semibold text-gray-500">SL:</span>{" "}
            {op.stop_loss ? parseFloat(op.stop_loss).toFixed(2) : "-"}
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <div className="text-gray-500">
            G/P: <LiveProfitCell operation={op} />
          </div>
          {op.cerrada ? (
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs">
              Cerrado
            </span>
          ) : (
            <button
              onClick={(e) => handleCloseOperation(e, op.id)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-md text-xs transition-colors cursor-pointer"
              style={{ backgroundColor: "#410093" }}
            >
              Cerrar
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );

  return (
    <Card className="flex-grow flex flex-col overflow-hidden">
      <div className="p-3 bg-gray-50 flex justify-between items-center flex-shrink-0">
        <h3 className="text-base font-bold text-gray-900">
          Historial de Operaciones
        </h3>
        <div className="flex items-center">
          <label htmlFor="filter" className="text-sm text-gray-500 mr-2">
            Filtrar:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white text-gray-800 text-sm rounded-md p-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="todas">Todas</option>
            <option value="abiertas">Abiertas</option>
            <option value="cerradas">Cerradas</option>
          </select>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        <table className="hidden sm:table w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase sticky top-0 z-10">
            <tr>
              {columns.map((h) => (
                <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c} className="px-3 py-2">
                        <Skeleton className="h-5" />
                      </td>
                    ))}
                  </tr>
                ))
              : operations.map((op) => (
                  <tr
                    key={op.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onRowClick(op)}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(op.fecha).toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-2 font-bold whitespace-nowrap ${
                        op.tipo_operacion.toLowerCase().includes("buy")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {op.tipo_operacion}
                    </td>
                    <td className="px-3 py-2 font-mono">{op.volumen}</td>
                    <td className="px-3 py-2 font-semibold">{op.activo}</td>
                    <td className="px-3 py-2 font-mono">
                      {parseFloat(op.precio_entrada).toFixed(4)}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {op.cerrada && op.precio_cierre
                        ? parseFloat(op.precio_cierre).toFixed(4)
                        : "-"}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {op.take_profit
                        ? parseFloat(op.take_profit).toFixed(2)
                        : "-"}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {op.stop_loss ? parseFloat(op.stop_loss).toFixed(2) : "-"}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      1:{op.apalancamiento || 1}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      ${parseFloat(op.capital_invertido || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <LiveProfitCell operation={op} />
                    </td>
                    <td className="px-3 py-2">
                      {op.cerrada ? (
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs">
                          Cerrado
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleCloseOperation(e, op.id)}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded-md text-xs w-full transition-colors cursor-pointer"
                          style={{ backgroundColor: "#410093" }}
                        >
                          Cerrar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        <div className="sm:hidden p-2 space-y-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))
            : operations.map(renderMobileCard)}
        </div>
      </div>
      <div className="p-2 border-t border-gray-200">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </Card>
  );
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-4xl",
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm p-4 cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} text-gray-900 border border-gray-200 flex flex-col max-h-[90vh]`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-shrink-0 flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-800 cursor-pointer"
            >
              <Icons.X />
            </button>
          </div>
          <div className="overflow-y-auto p-4 sm:p-6">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ModalLivePrice = React.memo(({ symbol }) => {
  const { realTimePrices } = useContext(AppContext);
  // FIX: Usar la función de normalización clave
  const normalizedSymbol = normalizeAssetKey(symbol);
  const priceString = realTimePrices[normalizedSymbol];

  // FIX: Convertir explícitamente a número
  const price = parseFloat(priceString);

  const flashClass = useFlashOnUpdate(price);
  const baseColor = !isNaN(price) ? "text-gray-900" : "text-yellow-500";
  const finalColorClass = flashClass || baseColor;
  return (
    <span
      className={`font-mono transition-colors duration-300 ${finalColorClass}`}
    >
      {!isNaN(price) ? `$${price.toFixed(4)}` : "Cargando..."}
    </span>
  );
});

// Helper para calcular la comisión de forma local para el modal
const calculateCommissionCost = (price, volume, commissionPercentage) => {
  if (!price || !volume || !commissionPercentage) return 0;
  // Comisión: Volumen Nocional * Porcentaje de Comisión
  const volumenNocional = price * volume;
  const commissionCost = volumenNocional * (commissionPercentage / 100);
  return commissionCost;
};

// NUEVO Helper para estimar el costo de Swap diario
const calculateSwapDailyCost = (
  price,
  volume,
  swapDailyPercentage,
  leverage
) => {
  if (!price || !volume || !swapDailyPercentage || !leverage || leverage === 0)
    return 0;

  // El swap se aplica sobre el margen requerido (capital invertido).
  const margen = (price * volume) / leverage;
  // Swap se aplica sobre el margen requerido. Usamos valor absoluto.
  const swapCost = margen * (swapDailyPercentage / 100);
  return swapCost;
};

const NewOperationModal = ({ isOpen, onClose, operationData, onConfirm }) => {
  const { type, asset, volume } = operationData || {};
  const { realTimePrices, commissions } = useContext(AppContext);
  // FIX: Usar la función de normalización clave
  const normalizedAsset = normalizeAssetKey(asset);
  const livePrice = realTimePrices[normalizedAsset]; // Esto es un STRING
  const livePriceNum = parseFloat(livePrice); // Usar número para cálculos

  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [leverage, setLeverage] = useState(1);
  const [leverageOptions, setLeverageOptions] = useState([1]);

  useEffect(() => {
    // Cargar opciones de apalancamiento permitidas desde el backend
    if (isOpen) {
      axios
        .get("/leverage-options")
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setLeverageOptions(res.data);
            // Asegurarse que el apalancamiento seleccionado sea válido
            if (!res.data.includes(leverage)) {
              setLeverage(res.data[0]);
            }
          }
        })
        .catch((err) => console.error("Error fetching leverage options:", err));
    }
  }, [isOpen]);

  const commissionCost = useMemo(() => {
    if (isNaN(livePriceNum) || !volume || !commissions) return 0;
    return calculateCommissionCost(
      livePriceNum,
      volume,
      commissions.commissionPercentage
    );
  }, [livePriceNum, volume, commissions]);

  // NUEVO: Cálculo del costo de Swap diario
  const swapDailyCost = useMemo(() => {
    if (isNaN(livePriceNum) || !volume || !commissions || !leverage) return 0;
    return calculateSwapDailyCost(
      livePriceNum,
      volume,
      commissions.swapDailyPercentage,
      leverage
    );
  }, [livePriceNum, volume, commissions, leverage]);

  const requiredMargin = isNaN(livePriceNum)
    ? "0.00"
    : ((livePriceNum * volume) / leverage).toFixed(2);

  useEffect(() => {
    if (!isOpen) {
      setTp("");
      setSl("");
      setLeverage(1);
    }
  }, [isOpen]);

  const calculatePotentialProfit = (value, targetType) => {
    if (!value || isNaN(livePriceNum) || !volume) return null;
    const targetPrice = parseFloat(value);
    if (isNaN(targetPrice)) return null;

    if (targetType === "tp") {
      // Nota: La comisión ya está aplicada en el balance, por lo que solo la restamos
      // para la estimación de PnL en el modal.
      return type === "buy"
        ? (targetPrice - livePriceNum) * volume - commissionCost
        : (livePriceNum - targetPrice) * volume - commissionCost;
    }
    if (targetType === "sl") {
      return type === "buy"
        ? (targetPrice - livePriceNum) * volume - commissionCost
        : (livePriceNum - targetPrice) * volume - commissionCost;
    }
    return null;
  };

  const potentialTpProfit = calculatePotentialProfit(tp, "tp");
  const potentialSlProfit = calculatePotentialProfit(sl, "sl");

  const handleConfirm = () => {
    onConfirm({
      volumen: volume,
      take_profit: tp ? parseFloat(tp) : null,
      stop_loss: sl ? parseFloat(sl) : null,
      tipo_operacion: type,
      apalancamiento: leverage,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${type === "buy" ? "Comprar" : "Vender"} ${asset}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-3 mb-4 text-gray-700">
        <p className="flex justify-between">
          <span>Precio Actual:</span>
          {/* Usamos el símbolo para que ModalLivePrice maneje la conversión */}
          <ModalLivePrice symbol={asset} />
        </p>
        <p className="flex justify-between">
          <span>Volumen:</span>
          <span className="font-mono text-gray-900">{volume}</span>
        </p>
        <div className="py-2 border-t border-gray-200">
          <p className="flex justify-between">
            <span>Margen Requerido:</span>
            <span className="font-mono text-gray-900">${requiredMargin}</span>
          </p>
          <p className="flex justify-between text-red-600 font-semibold">
            <span>
              Comisión de Apertura ({commissions.commissionPercentage}%):
            </span>
            <span className="font-mono">${commissionCost.toFixed(2)}</span>
          </p>
          {/* NUEVO: Costo de Swap Diario */}
          <p className="flex justify-between text-gray-600 text-sm">
            <span>
              Swap Diario Estimado ({commissions.swapDailyPercentage}%):
            </span>
            <span className="font-mono text-sm">
              ${swapDailyCost.toFixed(4)}
            </span>
          </p>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Seleccionar Apalancamiento
        </label>
        <select
          value={leverage}
          onChange={(e) => setLeverage(parseInt(e.target.value))}
          className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {leverageOptions.map((opt) => (
            <option key={opt} value={opt}>
              1:{opt}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Take Profit (opcional):
        </label>
        <input
          type="number"
          value={tp}
          onChange={(e) => setTp(e.target.value)}
          placeholder="Precio de cierre para tomar ganancias"
          className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {potentialTpProfit !== null && (
          <p className="text-xs mt-1 text-green-600">
            Ganancia Potencial Estimada: ${potentialTpProfit.toFixed(2)}
          </p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Stop Loss (opcional):
        </label>
        <input
          type="number"
          value={sl}
          onChange={(e) => setSl(e.target.value)}
          placeholder="Precio de cierre para limitar pérdidas"
          className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        {potentialSlProfit !== null && (
          <p className="text-xs mt-1 text-red-500">
            Pérdida Potencial Estimada: ${potentialSlProfit.toFixed(2)}
          </p>
        )}
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={handleConfirm}
          disabled={isNaN(livePriceNum)}
          className={`px-5 py-2 rounded-md text-white font-bold transition-colors cursor-pointer ${
            isNaN(livePriceNum)
              ? "bg-gray-400 cursor-not-allowed"
              : type === "buy"
              ? "bg-green-600 hover:bg-green-500"
              : "bg-red-600 hover:bg-red-500"
          }`}
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
};

const OperationDetailsModal = ({ isOpen, onClose, operation, profit }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`Detalles de Operación #${operation?.id}`}
    maxWidth="max-w-md"
  >
    {operation && (
      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Activo:</span>
          <span className="font-semibold text-gray-900">
            {operation.activo}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tipo:</span>
          <span
            className={`font-bold ${
              operation.tipo_operacion.toLowerCase().includes("buy")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {operation.tipo_operacion}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Volumen:</span>
          <span className="font-mono text-gray-900">{operation.volumen}</span>
        </div>
        <div className="flex justify-between">
          <span>Apalancamiento:</span>
          <span className="font-semibold text-gray-900">
            1:{operation.apalancamiento || 1}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Precio de Entrada:</span>
          <span className="font-mono text-gray-900">
            ${parseFloat(operation.precio_entrada).toFixed(4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Fecha de Apertura:</span>
          <span className="text-gray-900">
            {new Date(operation.fecha).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Estado:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              operation.cerrada
                ? "bg-gray-200 text-gray-800"
                : "bg-blue-500 text-white"
            }`}
          >
            {operation.cerrada ? "Cerrada" : "Abierta"}
          </span>
        </div>
        {operation.cerrada && (
          <div className="flex justify-between">
            <span>Precio de Cierre:</span>
            <span className="font-mono text-gray-900">
              {operation.precio_cierre
                ? `$${parseFloat(operation.precio_cierre).toFixed(4)}`
                : "-"}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Ganancia/Pérdida:</span>
          <span
            className={`font-mono font-bold ${
              profit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {profit.toFixed(2)} USD
          </span>
        </div>
      </div>
    )}
  </Modal>
);

const UserOperationsModal = ({
  isOpen,
  onClose,
  user,
  onUpdateOperation,
  setAlert,
}) => {
  const [operations, setOperations] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [showAll, setShowAll] = useState(false);

  const calculateProfit = (op) => {
    if (!op.cerrada || !op.precio_cierre) return 0;
    const { tipo_operacion, precio_cierre, precio_entrada, volumen } = op;
    if (tipo_operacion.toLowerCase().includes("buy")) {
      return (precio_cierre - precio_entrada) * volumen;
    } else {
      return (precio_entrada - precio_cierre) * volumen;
    }
  };

  const fetchUserOperations = useCallback(
    (page = 1) => {
      if (!isOpen || !user) return;

      const endpoint = showAll
        ? `/admin-operaciones/${user.id}/all`
        : `/admin-operaciones/${user.id}?page=${page}&limit=10`;

      axios
        .get(endpoint)
        .then((res) => {
          setOperations(
            res.data.operaciones.map((op) => ({
              ...op,
              ganancia: calculateProfit(op),
            }))
          );
          if (!showAll) {
            setPagination({
              currentPage: res.data.currentPage,
              totalPages: res.data.totalPages,
            });
          }
        })
        .catch((err) => console.error("Error fetching user operations:", err));
    },
    [isOpen, user, showAll]
  );

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setShowAll(false);
      fetchUserOperations(1);
    }
  }, [isOpen, user]); // Depend only on isOpen and user to reset

  useEffect(() => {
    // This effect runs when showAll changes
    fetchUserOperations(1);
  }, [showAll]);

  const handleInputChange = (opId, field, value) => {
    setOperations((currentOps) =>
      currentOps.map((op) => {
        if (op.id === opId) {
          const updatedOp = { ...op, [field]: value };
          if (
            [
              "precio_entrada",
              "precio_cierre",
              "volumen",
              "tipo_operacion",
              "cerrada",
            ].includes(field)
          ) {
            updatedOp.ganancia = calculateProfit(updatedOp);
          }
          return updatedOp;
        }
        return op;
      })
    );
  };

  const handleSave = async (operationData) => {
    try {
      await onUpdateOperation(operationData);
      setAlert({ message: "Operación actualizada con éxito", type: "success" });
    } catch (error) {
      setAlert({ message: "Error al actualizar la operación", type: "error" });
    }
  };

  const handlePageChange = (newPage) => {
    if (!showAll) {
      fetchUserOperations(newPage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Operaciones de ${user?.nombre}`}
      maxWidth="max-w-7xl"
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-500 cursor-pointer"
        >
          {showAll ? "Ver con Paginación" : "Ver Todas las Operaciones"}
        </button>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-200 text-gray-600 sticky top-0">
            <tr>
              {[
                "ID",
                "Activo",
                "Tipo",
                "Volumen",
                "P. Entrada",
                "P. Cierre",
                "TP",
                "SL",
                "Apalanc.",
                "Estado",
                "G/P",
                "Acción",
              ].map((h) => (
                <th key={h} className="p-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {operations.map((op) => (
              <tr key={op.id} className="border-b border-gray-200">
                <td className="p-1">{op.id}</td>
                <td className="p-1">
                  <input
                    type="text"
                    value={op.activo}
                    onChange={(e) =>
                      handleInputChange(op.id, "activo", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <select
                    value={op.tipo_operacion}
                    onChange={(e) =>
                      handleInputChange(op.id, "tipo_operacion", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  >
                    <option value="buy">buy</option>
                    <option value="sell">sell</option>
                  </select>
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="any"
                    value={op.volumen}
                    onChange={(e) =>
                      handleInputChange(op.id, "volumen", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="any"
                    value={op.precio_entrada}
                    onChange={(e) =>
                      handleInputChange(op.id, "precio_entrada", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="any"
                    value={op.precio_cierre || ""}
                    onChange={(e) =>
                      handleInputChange(op.id, "precio_cierre", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="any"
                    value={op.take_profit || ""}
                    onChange={(e) =>
                      handleInputChange(op.id, "take_profit", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="any"
                    value={op.stop_loss || ""}
                    onChange={(e) =>
                      handleInputChange(op.id, "stop_loss", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="1"
                    value={op.apalancamiento || 1}
                    onChange={(e) =>
                      handleInputChange(op.id, "apalancamiento", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="checkbox"
                    checked={op.cerrada}
                    onChange={(e) =>
                      handleInputChange(op.id, "cerrada", e.target.checked)
                    }
                    className="form-checkbox h-5 w-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </td>
                <td
                  className={`p-1 font-mono ${
                    op.ganancia >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {op.ganancia.toFixed(2)}
                </td>
                <td className="p-1">
                  <button
                    onClick={() => handleSave(op)}
                    className="bg-indigo-600 text-white px-3 py-1 text-xs rounded hover:bg-indigo-500 cursor-pointer"
                  >
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!showAll && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </Modal>
  );
};

const UserCard = React.memo(
  ({ user, onDataChange, onViewUserOps, onDeleteUser, onSave }) => {
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      onDataChange(user.id, name, value);
    };
    return (
      <Card className="text-sm">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-bold text-gray-900">{user.nombre}</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              user.rol === "admin"
                ? "bg-indigo-100 text-indigo-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {user.rol}
          </span>
        </div>
        <div className="space-y-2 my-4">
          <div className="flex items-center">
            <label className="w-24 text-gray-500">Balance:</label>
            <input
              type="number"
              name="balance"
              value={user.balance}
              onChange={handleInputChange}
              className="flex-1 p-1 bg-gray-50 rounded border border-gray-300"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-gray-500">ID:</label>
            <input
              type="text"
              name="identificacion"
              value={user.identificacion}
              onChange={handleInputChange}
              className="flex-1 p-1 bg-gray-50 rounded border border-gray-300"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-gray-500">Teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={user.telefono}
              onChange={handleInputChange}
              className="flex-1 p-1 bg-gray-50 rounded border border-gray-300"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-gray-500">Password:</label>
            <input
              type="password"
              name="password"
              value={user.password || ""}
              placeholder="No cambiar"
              onChange={handleInputChange}
              className="flex-1 p-1 bg-gray-50 rounded border border-gray-300"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={() => onSave(user)}
            className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-500 cursor-pointer"
          >
            Guardar
          </button>
          <button
            onClick={() => onViewUserOps(user)}
            title="Ver Operaciones"
            className="bg-yellow-500 text-white p-1 text-xs rounded hover:bg-yellow-400 cursor-pointer"
          >
            <Icons.ViewList />
          </button>
          <button
            onClick={() => onDeleteUser(user)}
            title="Eliminar Usuario"
            className="bg-red-600 text-white p-1 text-xs rounded hover:bg-red-500 cursor-pointer"
          >
            <Icons.X />
          </button>
        </div>
      </Card>
    );
  }
);

// NUEVO: Modal para Gestionar Crédito e Intereses
const ManageCreditModal = ({ isOpen, onClose, user, setAlert, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState(user?.tasa_interes || 4.0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
        setRate(user.tasa_interes !== undefined ? user.tasa_interes : 4.0);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleAction = async (action) => {
    if ((action === "assign" || action === "collect") && (!amount || isNaN(amount) || parseFloat(amount) <= 0)) {
        setAlert({ message: "Ingrese un monto válido", type: "error" });
        return;
    }

    setIsLoading(true);
    try {
      let endpoint = "";
      let payload = { userId: user.id };

      if (action === "assign") {
          endpoint = "/admin/credit/assign";
          payload.amount = parseFloat(amount);
      } else if (action === "collect") {
          endpoint = "/admin/credit/collect";
          payload.amount = parseFloat(amount);
      } else if (action === "apply_interest") {
          endpoint = "/admin/interest/apply";
      } else if (action === "collect_interest") {
          endpoint = "/admin/interest/collect";
      } else if (action === "update_rate") {
          endpoint = "/admin/interest/rate";
          payload.rate = parseFloat(rate);
      }
      
      const res = await axios.post(endpoint, payload);

      setAlert({
        message: res.data.message || "Operación exitosa",
        type: "success",
      });
      if (action !== "update_rate") setAmount("");
      onSuccess(); // Recargar usuarios
      if (action === "collect" || action === "assign") onClose();
    } catch (error) {
      setAlert({
        message: error.response?.data?.error || "Error en la operación",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gestión de Crédito - ${user.nombre}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        {/* Estadísticas de Crédito */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
                <span className="text-sm text-gray-600">Balance:</span>
                <span className="font-bold">${parseFloat(user.balance).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm text-gray-600">Crédito (Bono):</span>
                <span className="font-bold text-green-600">${parseFloat(user.credito || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2 border-gray-200">
                <span className="text-sm text-gray-600">Interés Acumulado:</span>
                <span className="font-bold text-red-600">${parseFloat(user.interes_acumulado || 0).toFixed(2)}</span>
            </div>
        </div>

        {/* Sección: Asignar/Cobrar Crédito */}
        <div>
            <h4 className="font-bold text-sm mb-2 text-gray-900">Movimientos de Crédito</h4>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md mb-2"
            placeholder="Monto"
          />
          <div className="flex gap-2">
            <button
                onClick={() => handleAction("assign")}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-500 disabled:opacity-50 text-sm"
            >
                Asignar
            </button>
            <button
                onClick={() => handleAction("collect")}
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-500 disabled:opacity-50 text-sm"
            >
                Cobrar
            </button>
          </div>
        </div>

        {/* Sección: Intereses */}
        <div className="border-t pt-4">
            <h4 className="font-bold text-sm mb-2 text-gray-900">Gestión de Intereses</h4>
            <div className="flex items-center gap-2 mb-3">
                <label className="text-sm text-gray-600 w-32">Tasa de Interés (%):</label>
                <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="flex-1 p-1 border border-gray-300 rounded"
                    step="0.1"
                />
                <button 
                  onClick={() => handleAction("update_rate")}
                  className="bg-indigo-600 text-white px-2 py-1 rounded text-xs"
                >
                    Actualizar
                </button>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => handleAction("apply_interest")}
                    disabled={isLoading}
                    className="flex-1 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-500 disabled:opacity-50 text-sm"
                >
                    Aplicar Interés
                </button>
                <button
                    onClick={() => handleAction("collect_interest")}
                    disabled={isLoading}
                    className="flex-1 bg-orange-600 text-white py-2 rounded hover:bg-orange-500 disabled:opacity-50 text-sm"
                >
                    Cobrar Interés
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                "Aplicar" calcula el interés sobre el crédito actual y lo suma a la deuda. 
                "Cobrar" descuenta la deuda acumulada del balance del usuario.
            </p>
        </div>
      </div>
    </Modal>
  );
};

const UserTableRow = React.memo(
  ({ user, onDataChange, onViewUserOps, onDeleteUser, onSave, onManageCredit }) => {
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      onDataChange(user.id, name, value);
    };
    return (
      <tr className="border-b border-gray-200">
        <td className="p-2 whitespace-nowrap text-xs text-gray-500">{user.id}</td>
        <td className="p-2">
          <input
            type="text"
            name="nombre"
            value={user.nombre}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300"
          />
        </td>
        <td className="p-2">
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300"
          />
        </td>
        <td className="p-2">
          <input
            type="number"
            name="balance"
            step="any"
            value={user.balance}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300"
          />
          <div className="text-xs text-green-600 mt-1">
            Crédito: ${parseFloat(user.credito || 0).toFixed(2)}
          </div>
        </td>
        <td className="p-2">
          <select
            name="rol"
            value={user.rol}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300 cursor-pointer"
          >
            <option value="usuario">Usuario</option>
            <option value="admin">Admin</option>
          </select>
        </td>
        <td className="p-2">
          <input
            type="text"
            name="identificacion"
            value={user.identificacion}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300"
          />
        </td>
        <td className="p-2">
          <input
            type="text"
            name="telefono"
            value={user.telefono}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300"
          />
        </td>
        <td className="p-2">
          <input
            type="password"
            name="password"
            placeholder="No cambiar"
            value={user.password || ""}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300"
          />
        </td>
        <td className="p-2 flex gap-2">
          <button
            onClick={() => onSave(user)}
            className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-500 cursor-pointer"
          >
            Guardar
          </button>
          <button
            onClick={() => onManageCredit(user)}
            title="Gestionar Crédito"
            className="bg-purple-600 text-white p-1 text-xs rounded hover:bg-purple-500 cursor-pointer"
          >
           <Icons.Banknotes className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewUserOps(user)}
            title="Ver Operaciones"
            className="bg-yellow-500 text-white p-1 text-xs rounded hover:bg-yellow-400 cursor-pointer"
          >
            <Icons.ViewList />
          </button>
          <button
            onClick={() => onDeleteUser(user)}
            title="Eliminar Usuario"
            className="bg-red-600 text-white p-1 text-xs rounded hover:bg-red-500 cursor-pointer"
          >
            <Icons.X />
          </button>
        </td>
      </tr>
    );
  }
);

const ManageUsersModal = ({
  isOpen,
  onClose,
  onViewUserOps,
  setAlert,
  onDeleteUser,
}) => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [selectedUserForCredit, setSelectedUserForCredit] = useState(null); // NUEVO

  const fetchUsers = useCallback(
    (page = 1) => {
      if (isOpen) {
        axios
          .get(`/usuarios?page=${page}&limit=10`)
          .then((res) => {
            const usersWithPasswordField = res.data.users.map((u) => ({
              ...u,
              password: "",
            }));
            setUsers(usersWithPasswordField);
            setPagination({
              currentPage: res.data.currentPage,
              totalPages: res.data.totalPages,
            });
          })
          .catch((err) => console.error("Error fetching users:", err));
      }
    },
    [isOpen]
  );

  useEffect(() => {
    if (isOpen) {
      fetchUsers(1);
    }
  }, [isOpen, fetchUsers]);

  const handleUserUpdate = (userId, field, value) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, [field]: value } : user
      )
    );
  };

  const handleSave = useCallback(
    async (userData) => {
      const payload = { ...userData };
      if (!payload.password) delete payload.password;
      try {
        await axios.post("/actualizar-usuario", payload);
        setAlert({
          message: "Usuario actualizado correctamente",
          type: "success",
        });
        fetchUsers(pagination.currentPage);
      } catch (error) {
        console.error("Error updating user:", error);
        setAlert({ message: "Error al actualizar el usuario", type: "error" });
      }
    },
    [fetchUsers, pagination.currentPage, setAlert]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Usuarios"
      maxWidth="max-w-7xl"
    >
      <div className="sm:hidden space-y-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onDataChange={handleUserUpdate}
            onViewUserOps={onViewUserOps}
            onDeleteUser={onDeleteUser}
            onSave={handleSave}
          />
        ))}
      </div>
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-200 text-gray-600 sticky top-0">
            <tr>
              {[
                "ID",
                "Nombre",
                "Email",
                "Balance",
                "Rol",
                "Identificación",
                "Teléfono",
                "Nueva Contraseña",
                "Acciones",
              ].map((h) => (
                <th key={h} className="p-2 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onDataChange={handleUserUpdate}
                onViewUserOps={onViewUserOps}
                onDeleteUser={onDeleteUser}
                onSave={handleSave}
                onManageCredit={setSelectedUserForCredit} // NUEVO
              />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) => fetchUsers(page)}
      />
      {/* Modal de Crédito */}
      <ManageCreditModal
        isOpen={!!selectedUserForCredit}
        onClose={() => setSelectedUserForCredit(null)}
        user={selectedUserForCredit}
        setAlert={setAlert}
        onSuccess={() => fetchUsers(pagination.currentPage)}
      />
    </Modal>
  );
};

// Modal para Gestionar Apalancamiento
const ManageLeverageModal = ({ isOpen, onClose, setAlert }) => {
  const [currentLeverage, setCurrentLeverage] = useState(200);
  const [newLeverage, setNewLeverage] = useState(200);

  useEffect(() => {
    if (isOpen) {
      axios
        .get("/admin/leverage")
        .then((res) => {
          setCurrentLeverage(res.data.maxLeverage);
          setNewLeverage(res.data.maxLeverage);
        })
        .catch((err) =>
          setAlert({
            message: "No se pudo cargar el apalancamiento actual",
            type: "error",
          })
        );
    }
  }, [isOpen, setAlert]);

  const handleSave = async () => {
    try {
      await axios.post("/admin/leverage", {
        newLeverage: parseInt(newLeverage),
      });
      setAlert({
        message: "Apalancamiento máximo actualizado con éxito",
        type: "success",
      });
      onClose();
    } catch (error) {
      setAlert({
        message: "Error al actualizar el apalancamiento",
        type: "error",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestionar Apalancamiento Máximo"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Apalancamiento máximo actual:{" "}
          <span className="font-bold text-gray-900">1:{currentLeverage}</span>
        </p>
        <div>
          <label
            htmlFor="leverage-select"
            className="block text-sm font-medium text-gray-700"
          >
            Seleccionar nuevo apalancamiento máximo
          </label>
          <select
            id="leverage-select"
            value={newLeverage}
            onChange={(e) => setNewLeverage(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {[1, 5, 10, 25, 50, 100, 200].map((val) => (
              <option key={val} value={val}>
                1:{val}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-500"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </Modal>
  );
};

// NUEVO MODAL: Gestionar Comisiones y Spreads
const ManageCommissionsModal = ({ isOpen, onClose, setAlert }) => {
  const { commissions, setCommissions } = useContext(AppContext);
  const [spread, setSpread] = useState(commissions.spreadPercentage);
  const [commission, setCommission] = useState(
    commissions.commissionPercentage
  );
  const [swap, setSwap] = useState(commissions.swapDailyPercentage); // AÑADIDO: Swap

  // Sincronizar estado local al abrir o si el estado global cambia
  useEffect(() => {
    setSpread(commissions.spreadPercentage);
    setCommission(commissions.commissionPercentage);
    setSwap(commissions.swapDailyPercentage); // AÑADIDO: Swap
  }, [commissions]);

  const handleSave = async () => {
    const newSpread = parseFloat(spread);
    const newCommission = parseFloat(commission);
    const newSwap = parseFloat(swap); // AÑADIDO: Swap

    if (
      isNaN(newSpread) ||
      newSpread < 0 ||
      isNaN(newCommission) ||
      newCommission < 0 ||
      isNaN(newSwap) ||
      newSwap < 0
    ) {
      setAlert({
        message: "Valores de Spread/Comisión/Swap inválidos.",
        type: "error",
      });
      return;
    }

    try {
      const res = await axios.post("/admin/commissions", {
        // La ruta del backend debe aceptar newSwap
        newSpread: newSpread,
        newCommission: newCommission,
        newSwap: newSwap, // AÑADIDO: Swap
      });

      // Actualizar estado global en el Context
      setCommissions({
        spreadPercentage: res.data.spreadPercentage,
        commissionPercentage: res.data.commissionPercentage,
        swapDailyPercentage: res.data.swapDailyPercentage, // ACTUALIZADO: Swap
      });

      setAlert({
        message: "Comisiones y Swap actualizados con éxito",
        type: "success",
      });
      onClose();
    } catch (error) {
      setAlert({
        message:
          error.response?.data?.error || "Error al actualizar comisiones/swap.",
        type: "error",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestionar Comisiones y Spread"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Define las tasas de Spread, Comisión y Swap diario para todas las
          operaciones.
        </p>

        {/* Campo de Spread */}
        <div>
          <label
            htmlFor="spread-input"
            className="block text-sm font-medium text-gray-700"
          >
            Spread de Mercado (en %)
          </label>
          <input
            id="spread-input"
            type="number"
            step="0.001"
            min="0"
            value={spread}
            onChange={(e) => setSpread(e.target.value)}
            placeholder="Ej: 0.01"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            El Spread se resta/suma al precio de entrada (Buy/Sell) para simular
            el diferencial.
          </p>
        </div>

        {/* Campo de Comisión */}
        <div>
          <label
            htmlFor="commission-input"
            className="block text-sm font-medium text-gray-700"
          >
            Comisión por Volumen (en %)
          </label>
          <input
            id="commission-input"
            type="number"
            step="0.01"
            min="0"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            placeholder="Ej: 0.1"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            La Comisión se resta del balance al abrir la operación (se calcula
            sobre el volumen nocional).
          </p>
        </div>

        {/* NUEVO: Campo de Swap */}
        <div>
          <label
            htmlFor="swap-input"
            className="block text-sm font-medium text-gray-700"
          >
            Swap Diario (en %)
          </label>
          <input
            id="swap-input"
            type="number"
            step="0.001"
            min="0"
            value={swap}
            onChange={(e) => setSwap(e.target.value)}
            placeholder="Ej: 0.05"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            El Swap (interés nocturno) se aplica diariamente sobre el margen
            usado.
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-500"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </Modal>
  );
};

// NUEVO COMPONENTE: Modal para enviar notificaciones (Solo Admin)
const ManageNotificationsModal = ({ isOpen, onClose, setAlert }) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (message.length < 5) {
      setAlert({
        message: "El mensaje debe ser de al menos 5 caracteres.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      // El backend necesita la ruta /admin/notificar para funcionar
      await axios.post("/admin/notificar", { mensaje: message });
      setAlert({
        message: "Notificación global enviada con éxito.",
        type: "success",
      });
      setMessage("");
      onClose();
    } catch (error) {
      setAlert({
        message:
          error.response?.data?.error || "Error al enviar la notificación.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar Notificación Global"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Este mensaje aparecerá en la parte superior del dashboard de todos los
          usuarios en tiempo real. Úsalo para avisos críticos como mantenimiento
          o actualizaciones.
        </p>
        <div>
          <label
            htmlFor="notification-message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mensaje (máx. 200 caracteres)
          </label>
          <textarea
            id="notification-message"
            rows="4"
            maxLength={200}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: Aviso de mantenimiento programado para las 2:00 AM UTC."
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {message.length} / 200
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSend}
            disabled={isLoading || message.length < 5}
            className="px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-500 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? "Enviando..." : "Enviar Notificación"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// NUEVO COMPONENTE: Banner de Notificación Global (Visible en el Dashboard)
const GlobalNotificationBanner = () => {
  const { globalNotification, setGlobalNotification } = useContext(AppContext);

  if (!globalNotification) return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 p-3 bg-red-600 text-white shadow-xl flex items-center justify-center text-sm"
    >
      <Icons.Bell className="h-5 w-5 mr-3 text-white" />
      <span className="font-semibold">{globalNotification.message}</span>
      <button
        onClick={() => setGlobalNotification(null)}
        className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <Icons.X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
    <div className="text-gray-700 mb-6">{children}</div>
    <div className="flex justify-end gap-4">
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition-colors"
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors"
      >
        Confirmar
      </button>
    </div>
  </Modal>
);

const UserProfile = React.memo(({ setAlert, onBack }) => {
  const { user, refreshUser } = useContext(AppContext);
  const [identificacion, setIdentificacion] = useState(
    user?.identificacion || ""
  );
  const [telefono, setTelefono] = useState(user?.telefono || "");

  useEffect(() => {
    setIdentificacion(user?.identificacion || "");
    setTelefono(user?.telefono || "");
  }, [user]);

  const handleSave = async () => {
    try {
      await axios.put("/me/profile", { identificacion, telefono });
      setAlert({ message: "Perfil actualizado con éxito", type: "success" });
      refreshUser();
    } catch (error) {
      setAlert({ message: "Error al actualizar el perfil", type: "error" });
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="flex items-center text-indigo-600 hover:text-indigo-500 mb-4 cursor-pointer"
      >
        <Icons.ChevronLeft /> Volver al Menú
      </button>
      <h2 className="text-xl font-bold mb-4 text-gray-900">Mis datos</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Nombre
          </label>
          <input
            type="text"
            readOnly
            value={user?.nombre || ""}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Email
          </label>
          <input
            type="email"
            readOnly
            value={user?.email || ""}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label
            htmlFor="identificacion"
            className="block text-sm font-medium mb-1 text-gray-500"
          >
            Identificación
          </label>
          <input
            id="identificacion"
            type="text"
            value={identificacion}
            onChange={(e) => setIdentificacion(e.target.value)}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label
            htmlFor="telefono"
            className="block text-sm font-medium mb-1 text-gray-500"
          >
            Teléfono
          </label>
          <input
            id="telefono"
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-md text-white font-bold bg-indigo-600 hover:bg-indigo-500 cursor-pointer transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
});

const PaymentMethodButton = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-4 flex items-center gap-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
  >
    {icon}
    <span className="font-semibold text-lg text-gray-800">{text}</span>
  </button>
);

const DepositView = React.memo(({ onBack, onSelectMethod }) => (
  <div className="p-4">
    <button
      onClick={onBack}
      className="flex items-center text-indigo-600 hover:text-indigo-500 mb-6 cursor-pointer"
    >
      <Icons.ChevronLeft /> Volver al Menú Principal
    </button>
    <h2 className="text-2xl font-bold mb-6 text-gray-900">
      Seleccione un Método de Depósito
    </h2>
    <div className="space-y-4">
      {/* NUEVO: Botón para Tarjeta de Crédito/Débito */}
      <PaymentMethodButton
        icon={<Icons.CreditCard className="h-8 w-8 text-blue-500" />}
        text="Tarjeta de Crédito/Débito"
        onClick={() => onSelectMethod("card", "deposit")}
      />
      <PaymentMethodButton
        icon={<Icons.CreditCard className="h-8 w-8 text-indigo-500" />}
        text="Criptomonedas"
        onClick={() => onSelectMethod("crypto", "deposit")}
      />
      <PaymentMethodButton
        icon={<Icons.Banknotes className="h-8 w-8 text-green-500" />}
        text="Transferencia Bancaria"
        onClick={() => onSelectMethod("bank", "deposit")}
      />
    </div>
  </div>
));

const WithdrawView = React.memo(({ onBack, onSelectMethod }) => (
  <div className="p-4">
    <button
      onClick={onBack}
      className="flex items-center text-indigo-600 hover:text-indigo-500 mb-6 cursor-pointer"
    >
      <Icons.ChevronLeft /> Volver al Menú Principal
    </button>
    <h2 className="text-2xl font-bold mb-6 text-gray-900">
      Seleccione un Método de Retiro
    </h2>
    <div className="space-y-4">
      {/* NUEVO: Botón para Tarjeta de Crédito/Débito */}
      <PaymentMethodButton
        icon={<Icons.CreditCard className="h-8 w-8 text-blue-500" />}
        text="Tarjeta de Crédito/Débito"
        onClick={() => onSelectMethod("card", "withdraw")}
      />
      <PaymentMethodButton
        icon={<Icons.CreditCard className="h-8 w-8 text-indigo-500" />}
        text="Criptomonedas"
        onClick={() => onSelectMethod("crypto", "withdraw")}
      />
      <PaymentMethodButton
        icon={<Icons.Banknotes className="h-8 w-8 text-green-500" />}
        text="Transferencia Bancaria"
        onClick={() => onSelectMethod("bank", "withdraw")}
      />
    </div>
  </div>
));

const MenuButton = React.memo(({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors flex items-center text-gray-700 cursor-pointer"
  >
    {icon}
    <span className="ml-3">{text}</span>
  </button>
));

const SideMenu = React.memo(
  ({ isOpen, onClose, setAlert, onSelectPaymentMethod }) => {
    const [view, setView] = useState("main");
    useEffect(() => {
      if (isOpen) setView("main");
    }, [isOpen]);

    const handleSelectMethod = (method, type) => {
      onSelectPaymentMethod(method, type);
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 cursor-pointer"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
              className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 border-r border-gray-200 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <img
                  className="mb-2"
                  src={VITE_PLATFORM_LOGO || "/unique1global-logo.png"}
                  width="220"
                  alt="Logo"
                />
              </div>
              <div className="flex-grow overflow-y-auto">
                {view === "main" && (
                  <div className="p-4 space-y-2">
                    <MenuButton
                      icon={
                        <Icons.ArrowDownTray className="h-5 w-5 text-green-500" />
                      }
                      text="Depositar"
                      onClick={() => setView("deposit")}
                    />
                    <MenuButton
                      icon={
                        <Icons.ArrowUpTray className="h-5 w-5 text-indigo-500" />
                      }
                      text="Retirar"
                      onClick={() => setView("withdraw")}
                    />
                    <MenuButton
                      icon={<Icons.Key className="h-5 w-5 text-gray-500" />}
                      text="Cambiar Contraseña"
                      onClick={() => setView("change-password")}
                    />
                    <div className="my-2 h-px bg-gray-200" />
                    <MenuButton
                      icon={
                        <Icons.UserCircle className="h-5 w-5 text-gray-500" />
                      }
                      text="Mis Datos"
                      onClick={() => setView("profile")}
                    />
                    <MenuButton
                      icon={
                        <Icons.ShieldCheck className="h-5 w-5 text-gray-500" />
                      }
                      text="Seguridad"
                      onClick={() => setView("security")}
                    />
                  </div>
                )}
                {view === "profile" && (
                  <UserProfile
                    setAlert={setAlert}
                    onBack={() => setView("main")}
                  />
                )}
                {view === "deposit" && (
                  <DepositView
                    onBack={() => setView("main")}
                    onSelectMethod={(method) =>
                      handleSelectMethod(method, "deposit")
                    }
                  />
                )}
                {view === "withdraw" && (
                  <WithdrawView
                    onBack={() => setView("main")}
                    onSelectMethod={(method) =>
                      handleSelectMethod(method, "withdraw")
                    }
                  />
                )}
                {view === "change-password" && (
                  <ChangePasswordView
                    setAlert={setAlert}
                    onBack={() => setView("main")}
                  />
                )}
                {view === "security" && (
                  <SecurityView onBack={() => setView("main")} />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);

const CryptoPaymentModal = ({ isOpen, onClose, type, onSubmitted }) => {
  const [network, setNetwork] = useState("eth");
  const depositAddress = "0x36e622B28fE228346CEF0D86bbd84235b36aa918"; // Dirección de ejemplo

  const handleCopy = () => {
    // Usar execCommand ya que clipboard.writeText puede fallar en iframes
    const el = document.createElement("textarea");
    el.value = depositAddress;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    onSubmitted();
  };

  const handleWithdrawal = (e) => {
    e.preventDefault();
    onSubmitted();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${
        type === "deposit" ? "Depositar" : "Retirar"
      } con Criptomonedas`}
      maxWidth="max-w-lg"
    >
      {type === "deposit" ? (
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            Envía ETH a la siguiente dirección usando la red ETH (ERC20).
          </p>
          <div className="bg-gray-100 p-4 rounded-lg my-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${depositAddress}`}
              alt="QR Code"
              className="mx-auto border-4 border-white rounded-lg"
            />
          </div>
          <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between gap-4">
            <span className="font-mono text-sm break-all text-gray-700">
              {depositAddress}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <Icons.Clipboard className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-yellow-600 mt-4">
            Asegúrate de enviar únicamente ETH en la red ERC20. Enviar otra
            moneda o usar otra red podría resultar en la pérdida de tus fondos.
          </p>
        </div>
      ) : (
        <form onSubmit={handleWithdrawal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tu Dirección de Billetera (USDT)
            </label>
            <input
              required
              type="text"
              placeholder="Introduce tu dirección de billetera"
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Red
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TRC20">TRON (TRC20)</option>
              <option value="ERC20">Ethereum (ERC20)</option>
              <option value="BEP20">BNB Smart Chain (BEP20)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a Retirar
            </label>
            <input
              required
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-5 py-2 rounded-md text-white font-bold bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              Solicitar Retiro
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

const BankTransferModal = ({ isOpen, onClose, type, onSubmitted }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`${type === "deposit" ? "Depositar" : "Retirar"} por Transferencia`}
    maxWidth="max-w-lg"
  >
    <div className="space-y-4 text-gray-700">
      <p>
        Para continuar, por favor contacta a soporte con los siguientes
        detalles:
      </p>
      <ul className="list-disc list-inside bg-gray-100 p-4 rounded-md">
        <li>
          Tipo de operación:{" "}
          <span className="font-semibold text-gray-900">
            {type === "deposit" ? "Depósito" : "Retiro"}
          </span>
        </li>
        <li>Monto deseado</li>
        <li>Comprobante de la transacción (si es un depósito)</li>
      </ul>
      <div className="text-center pt-4">
        <button
          onClick={onSubmitted}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-md text-white font-bold"
        >
          Entendido
        </button>
      </div>
    </div>
  </Modal>
);

// Modal para pagos con tarjeta
const CardPaymentModal = ({ isOpen, onClose, type, onSubmitted }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // En una aplicación real, aquí se integraría una pasarela de pago como Stripe.
    // Por ahora, solo simulamos el envío exitoso.
    onSubmitted();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${
        type === "deposit" ? "Depositar" : "Retirar"
      } con Tarjeta de Crédito/Débito`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto
          </label>
          <input
            required
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Titular
          </label>
          <input
            required
            type="text"
            placeholder="John Doe"
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Tarjeta
          </label>
          <input
            required
            type="text"
            placeholder="0000 0000 0000 0000"
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiración (MM/YY)
            </label>
            <input
              required
              type="text"
              placeholder="MM/YY"
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              required
              type="text"
              placeholder="123"
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="w-full px-5 py-3 rounded-md text-white font-bold bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            {type === "deposit" ? "Confirmar Depósito" : "Solicitar Retiro"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const SecurityView = React.memo(({ onBack }) => {
  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="flex items-center text-indigo-600 hover:text-indigo-500 mb-4 cursor-pointer"
      >
        <Icons.ChevronLeft /> Volver
      </button>
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        Seguridad de la Cuenta
      </h2>
      <p className="text-gray-600">
        Próximamente: Verificación de dos factores y más opciones de seguridad.
      </p>
    </div>
  );
});

const DashboardPage = () => {
  const {
    user,
    selectedAsset,
    setSelectedAsset,
    realTimePrices,
    setRealTimePrices,
    commissions, // Necesario para el cálculo de margen
    setGlobalNotification,
    globalNotification,
  } = useContext(AppContext);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [mobileVolume, setMobileVolume] = useState(0.01);
  const wsRef = useRef(null);

  // FIX CRÍTICO: Nueva función para normalizar activos en la lista inicial
  const normalizeInitialAssets = useCallback((assets) => {
    return assets.map((symbol) => {
      // Si es cripto (BTC-USDT), lo dejamos como está para el display y suscripción
      if (symbol.endsWith("-USDT")) return symbol;
      // Si es Forex/Commodity (EUR/USD, XAU/USD), lo dejamos como está
      if (symbol.includes("/")) return symbol;
      // Si es una acción/índice, lo dejamos como está
      return symbol;
    });
  }, []);

  const initialAssets = useMemo(
    () =>
      normalizeInitialAssets([
        "BTC-USDT",
        "ETH-USDT",
        "SOL-USDT",
        "AAPL",
        "TSLA",
        "NVDA",
        "AMZN",
        "EUR/USD",
        "GBP/USD",
        "USD/JPY",
        "XAU/USD",
        "WTI/USD",
      ]),
    [normalizeInitialAssets]
  );

  const [userAssets, setUserAssets] = useState(() => {
    try {
      const savedAssets = localStorage.getItem("userTradingAssets");
      const parsedAssets = savedAssets
        ? JSON.parse(savedAssets)
        : initialAssets;
      // Asegurar que la lista de activos guardada también pase por la normalización inicial
      return Array.isArray(parsedAssets) && parsedAssets.length > 0
        ? normalizeInitialAssets(parsedAssets)
        : initialAssets;
    } catch (error) {
      return initialAssets;
    }
  });

  const [allOpenOperations, setAllOpenOperations] = useState([]);
  const [operations, setOperations] = useState([]);
  const [stats, setStats] = useState({});
  const [balance, setBalance] = useState(0);
  const [performanceData, setPerformanceData] = useState([]);
  const [metrics, setMetrics] = useState({
    balance: 0,
    equity: 0,
    usedMargin: 0,
    freeMargin: 0,
    marginLevel: 0,
  });
  const [alert, setAlert] = useState({ message: "", type: "info" });
  const [opHistoryFilter, setOpHistoryFilter] = useState("todas");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isNewOpModalOpen, setIsNewOpModalOpen] = useState(false);
  const [newOpModalData, setNewOpModalData] = useState(null);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isUserOpsModalOpen, setIsUserOpsModalOpen] = useState(false);
  const [isOpDetailsModalOpen, setIsOpDetailsModalOpen] = useState(false);
  const [currentUserForOps, setCurrentUserForOps] = useState(null);
  const [currentOpDetails, setCurrentOpDetails] = useState(null);
  const [isLeverageModalOpen, setIsLeverageModalOpen] = useState(false);
  const [isCommissionsModalOpen, setIsCommissionsModalOpen] = useState(false); // NUEVO
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] =
    useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [paymentModalConfig, setPaymentModalConfig] = useState({
    isOpen: false,
    type: "",
    method: "",
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    children: null,
    onConfirm: () => {},
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleOpenPaymentModal = (method, type) => {
    setPaymentModalConfig({ isOpen: true, method, type });
    setIsSideMenuOpen(false);
  };
  const handleClosePaymentModal = () =>
    setPaymentModalConfig({ isOpen: false, type: "", method: "" });

  const handlePaymentSubmitted = () => {
    handleClosePaymentModal();
    setConfirmationModal({
      isOpen: true,
      title: "Solicitud en Proceso",
      children:
        "Su solicitud ha sido recibida. Un agente se comunicará con usted a la brevedad para completar la operación.",
      onConfirm: () =>
        setConfirmationModal({
          isOpen: false,
          title: "",
          children: null,
          onConfirm: () => {},
        }),
    });
  };

  const fetchData = useCallback(
    async (page = 1, filter = "todas") => {
      if (!user) return;
      setIsLoadingData(true);
      try {
        const [historialRes, statsRes, balanceRes, performanceRes, openOpsRes] =
          await Promise.all([
            axios.get(`/historial?page=${page}&limit=5&filter=${filter}`),
            axios.get("/estadisticas"),
            axios.get("/balance"),
            axios.get("/rendimiento"),
            axios.get("/historial?filter=abiertas&limit=999"),
          ]);
        setOperations(historialRes.data.operations);
        setPagination({
          currentPage: historialRes.data.currentPage,
          totalPages: historialRes.data.totalPages,
        });
        setStats(statsRes.data);
        setBalance(parseFloat(balanceRes.data.balance));
        setPerformanceData(performanceRes.data);
        setAllOpenOperations(openOpsRes.data.operations);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setAlert({ message: "Error al cargar los datos", type: "error" });
      } finally {
        setIsLoadingData(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) fetchData(1, "todas");
  }, [user, fetchData]);

  useEffect(() => {
    if (!user || !userAssets.length) return;

    const connectWebSocket = () => {
      const wsUrl = VITE_WSS_URL;
      if (!wsUrl) {
        console.error("WebSocket URL is not defined.");
        return;
      }
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected. Subscribing to assets.");
        ws.send(JSON.stringify({ type: "subscribe", symbols: userAssets }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "price_update" && data.prices) {
            // --- FIX CRÍTICO: APLICAR VALIDACIÓN RIGUROSA A LOS DATOS DE WS ---
            const incomingPrices = data.prices;
            const validatedPrices = {};

            for (const key in incomingPrices) {
              const value = incomingPrices[key];

              // 1. Asegurar que la clave sea una cadena válida (pre-normalizada por el backend)
              if (typeof key !== "string" || key.length === 0) continue;

              // 2. Asegurar que el valor sea un número o una cadena que pueda ser un número
              if (typeof value === "string" || typeof value === "number") {
                // Almacenar siempre como cadena para consistencia y para que toFixed funcione
                // correctamente en los componentes AssetPrice
                validatedPrices[key] = String(value);
              } else {
                console.warn(`Valor de precio inválido para ${key}:`, value);
              }
            }

            setRealTimePrices((prev) => ({ ...prev, ...validatedPrices }));
            // --- FIN FIX CRÍTICO ---
          } else if (data.type === "admin_notification" && data.message) {
            // AÑADIDO: Manejar notificación del administrador
            setGlobalNotification({
              message: data.message,
              id: data.id,
              date: data.date,
            });
          } else if (data.type === "operacion_cerrada") {
            // AÑADIDO: Manejar cierre de operación por Stop-Out/TP/SL
            setAlert({
              message: `Operación #${data.operacion_id} (${
                data.activo
              }) cerrada por ${data.tipoCierre}. G/P: $${parseFloat(
                data.ganancia
              ).toFixed(2)}`,
              type: "success",
            });
            // Recargar el historial y balance para reflejar el cierre
            fetchData(pagination.currentPage, opHistoryFilter);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      ws.onclose = (e) => {
        console.log(
          "WebSocket disconnected. Attempting to reconnect...",
          e.reason
        );
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        console.log("Closing WebSocket connection.");
        wsRef.current.close();
      }
    };
  }, [user, userAssets]); // userAssets es la clave, ya que activa la suscripción WS

  useEffect(() => {
    localStorage.setItem("userTradingAssets", JSON.stringify(userAssets));
  }, [userAssets]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user) {
        axios.get("/estadisticas").then((res) => setStats(res.data));
        axios
          .get("/balance")
          .then((res) => setBalance(parseFloat(res.data.balance)));
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    const openOperations = allOpenOperations;
    const pnl = openOperations.reduce((total, op) => {
      // FIX: Usar la función de normalización clave
      const normalizedSymbol = normalizeAssetKey(op.activo);
      // FIX: Asegurarse de que el precio sea un número para el cálculo
      const currentPrice = parseFloat(realTimePrices[normalizedSymbol]);

      if (isNaN(currentPrice)) return total;

      return (
        total +
        (op.tipo_operacion.toLowerCase() === "sell"
          ? (op.precio_entrada - currentPrice) * op.volumen
          : (currentPrice - op.precio_entrada) * op.volumen)
      );
    }, 0);

    // Cálculo de Swap diario para PnL flotante (simulado, pero se cobra en el backend)
    // Se calcula el Swap diario para mostrar un PnL más preciso, aunque el cobro lo hace el backend.
    const swapCostTotal = openOperations.reduce((total, op) => {
      const margen = parseFloat(op.capital_invertido || 0);
      // Usar la comisión del contexto para el cálculo local
      const swapRate = commissions.swapDailyPercentage / 100;
      return total + margen * swapRate;
    }, 0);

    const usedMargin = openOperations.reduce(
      (total, op) => total + parseFloat(op.capital_invertido || 0),
      0
    );
    // El PnL total debe incluir el costo de swap desde que se abrió
    // NOTA: Para una simulación simplificada, se muestra solo el PnL de mercado.
    // Los cambios de balance por swap ocurren solo por el intervalo del backend.
    const equity = balance + pnl;
    const freeMargin = equity - usedMargin;
    const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 0;
    setMetrics({ balance, equity, usedMargin, freeMargin, marginLevel });
  }, [realTimePrices, allOpenOperations, balance, commissions]); // Añadir commissions como dependencia

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(
        () => setAlert({ message: "", type: "info" }),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handlePageChange = (newPage) => fetchData(newPage, opHistoryFilter);
  const handleFilterChange = (newFilter) => {
    setOpHistoryFilter(newFilter);
    fetchData(1, newFilter);
  };

  const handleOpenNewOpModal = useCallback(
    (type, volume) => {
      if (!volume || volume <= 0) {
        setAlert({ message: "El volumen debe ser mayor a 0.", type: "error" });
        return;
      }
      // FIX: Usar la función de normalización clave
      const normalizedAsset = normalizeAssetKey(selectedAsset);
      // FIX: Asegurarse de que el precio sea un número para la validación
      const currentPrice = parseFloat(realTimePrices[normalizedAsset]);

      if (isNaN(currentPrice)) {
        setAlert({
          message: "Precio del activo no disponible. Intente de nuevo.",
          type: "error",
        });
        return;
      }
      // La validación del margen libre se hará en el backend con el apalancamiento
      setNewOpModalData({ type, volume, asset: selectedAsset });
      setIsNewOpModalOpen(true);
    },
    [realTimePrices, selectedAsset]
  );

  const handleConfirmOperation = useCallback(
    async (opDetails) => {
      // FIX: Usar la función de normalización clave
      const normalizedAsset = normalizeAssetKey(selectedAsset);
      // FIX: Asegurarse de que el precio sea un número para el cálculo
      const livePrice = parseFloat(realTimePrices[normalizedAsset]);

      if (isNaN(livePrice)) {
        setAlert({
          message: "No se pudo confirmar, el precio no está disponible.",
          type: "error",
        });
        return;
      }
      try {
        const payload = {
          ...opDetails,
          activo: selectedAsset,
          precio_entrada: livePrice,
        };
        const { data } = await axios.post("/operar", payload);
        if (data.success) {
          setAlert({
            message: `Operación realizada con éxito. Comisión: $${data.comision.toFixed(
              2
            )}`,
            type: "success",
          });
          fetchData(1, opHistoryFilter);
        } else {
          setAlert({ message: data.error || "Error al operar", type: "error" });
        }
      } catch (error) {
        setAlert({
          message: error.response?.data?.error || "Error de red",
          type: "error",
        });
      }
    },
    [selectedAsset, opHistoryFilter, fetchData, realTimePrices]
  );

  const handleAddAsset = useCallback(
    (symbol) => {
      let upperSymbol = symbol.toUpperCase().trim();

      // Ajustar el formato de cripto para la lista si viene sin guion
      if (upperSymbol.endsWith("USDT") && !upperSymbol.includes("-")) {
        // Asume que si termina en USDT pero no tiene guion (ej: BTCUSDT),
        // el usuario quiso ingresar el formato de display (ej: BTC-USDT)
        // La suscripción debe manejar el formato con guion, ya que el backend lo mapea.
        upperSymbol = `${upperSymbol.slice(0, -4)}-USDT`;
      }

      if (upperSymbol && !userAssets.includes(upperSymbol)) {
        const newAssets = [...userAssets, upperSymbol];
        setUserAssets(newAssets);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({ type: "subscribe", symbols: [upperSymbol] })
          );
        }
        setAlert({ message: `${upperSymbol} añadido.`, type: "success" });
      } else if (userAssets.includes(upperSymbol)) {
        setAlert({
          message: `${upperSymbol} ya existe en la lista.`,
          type: "error",
        });
      }
    },
    [userAssets]
  );

  const handleRemoveAsset = useCallback(
    (symbol) => {
      const newAssets = userAssets.filter((a) => a !== symbol);
      setUserAssets(newAssets);
      if (selectedAsset === symbol) {
        setSelectedAsset(newAssets.length > 0 ? newAssets[0] : "BTC-USDT");
      }
      setAlert({ message: `${symbol} eliminado.`, type: "success" });
    },
    [userAssets, selectedAsset, setSelectedAsset]
  );

  const handleViewUserOps = useCallback((user) => {
    setCurrentUserForOps(user);
    setIsUserOpsModalOpen(true);
  }, []);

  const handleOpRowClick = useCallback(
    (op) => {
      // FIX: Usar la función de normalización clave
      const normalizedSymbol = normalizeAssetKey(op.activo);
      // FIX: Asegurarse de que el precio sea un número
      const currentPrice = parseFloat(realTimePrices[normalizedSymbol]);

      const profit = op.cerrada
        ? parseFloat(op.ganancia || 0)
        : isNaN(currentPrice)
        ? 0
        : op.tipo_operacion.toLowerCase() === "sell"
        ? (op.precio_entrada - currentPrice) * op.volumen
        : (currentPrice - op.precio_entrada) * op.volumen;

      setCurrentOpDetails({ op, profit });
      setIsOpDetailsModalOpen(true);
    },
    [realTimePrices]
  );

  const handleUpdateOperation = useCallback(
    async (operationData) => {
      try {
        await axios.post("/admin/actualizar-operacion", operationData);
        setAlert({ message: "Operación actualizada", type: "success" });
        fetchData(pagination.currentPage, opHistoryFilter); // Recargar datos del usuario
      } catch (error) {
        setAlert({
          message: "Error al actualizar la operación",
          type: "error",
        });
        throw error; // Re-throw para que el modal sepa que falló
      }
    },
    [fetchData, pagination.currentPage, opHistoryFilter]
  );

  const handleDeleteUser = useCallback((userToDelete) => {
    setConfirmationModal({
      isOpen: true,
      title: `Eliminar Usuario`,
      children: `¿Estás seguro de que quieres eliminar a ${userToDelete.nombre}? Esta acción no se puede deshacer y eliminará todas sus operaciones.`,
      onConfirm: async () => {
        try {
          await axios.delete(`/usuarios/${userToDelete.id}`);
          setAlert({
            message: `Usuario ${userToDelete.nombre} eliminado.`,
            type: "success",
          });
          setIsUsersModalOpen(false);
        } catch (error) {
          setAlert({
            message:
              error.response?.data?.error || "Error al eliminar usuario.",
            type: "error",
          });
        } finally {
          setConfirmationModal({
            isOpen: false,
            title: "",
            children: null,
            onConfirm: () => {},
          });
        }
      },
    });
  }, []);

  const displayMetrics = {
    balance: metrics.balance.toFixed(2),
    equity: metrics.equity.toFixed(2),
    usedMargin: metrics.usedMargin.toFixed(2),
    freeMargin: metrics.freeMargin.toFixed(2),
    marginLevel: metrics.marginLevel.toFixed(2),
  };

  const platformLogo = VITE_PLATFORM_LOGO;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      <AnimatePresence>
        {alert.message && (
          <Toast
            message={alert.message}
            type={alert.type}
            onDismiss={() => setAlert({ message: "", type: "info" })}
          />
        )}
      </AnimatePresence>
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        setAlert={setAlert}
        onSelectPaymentMethod={handleOpenPaymentModal}
      />
      {paymentModalConfig.method === "crypto" && (
        <CryptoPaymentModal
          isOpen={paymentModalConfig.isOpen}
          onClose={handleClosePaymentModal}
          type={paymentModalConfig.type}
          onSubmitted={handlePaymentSubmitted}
        />
      )}
      {paymentModalConfig.method === "bank" && (
        <BankTransferModal
          isOpen={paymentModalConfig.isOpen}
          onClose={handleClosePaymentModal}
          type={paymentModalConfig.type}
          onSubmitted={handlePaymentSubmitted}
        />
      )}
      {/* NUEVO: Renderizado del modal de tarjeta */}
      {paymentModalConfig.method === "card" && (
        <CardPaymentModal
          isOpen={paymentModalConfig.isOpen}
          onClose={handleClosePaymentModal}
          type={paymentModalConfig.type}
          onSubmitted={handlePaymentSubmitted}
        />
      )}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
      >
        {confirmationModal.children}
      </ConfirmationModal>

      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              onClick={() => setIsSidebarVisible(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 h-full w-72 bg-white p-4 overflow-y-auto flex-shrink-0 border-r border-gray-200 flex flex-col z-40 lg:hidden"
            >
              <div className="flex-grow">
                <img
                  className="mb-4"
                  src={platformLogo}
                  width="220"
                  alt="Logo"
                />
                <AssetLists
                  assets={userAssets}
                  onAddAsset={handleAddAsset}
                  onRemoveAsset={handleRemoveAsset}
                />
              </div>
              <div className="flex-shrink-0">
                <StatisticsPanel
                  stats={stats}
                  performanceData={performanceData}
                  isLoading={isLoadingData}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <aside className="hidden lg:flex lg:flex-col w-72 bg-white p-4 overflow-y-auto flex-shrink-0 border-r border-gray-200">
        <div className="flex-grow">
          <img className="mb-4" src={platformLogo} width="220" alt="Logo" />
          <AssetLists
            assets={userAssets}
            onAddAsset={handleAddAsset}
            onRemoveAsset={handleRemoveAsset}
          />
        </div>
        <div className="flex-shrink-0">
          <StatisticsPanel
            stats={stats}
            performanceData={performanceData}
            isLoading={isLoadingData}
          />
        </div>
      </aside>
      <NewOperationModal
        isOpen={isNewOpModalOpen}
        onClose={() => setIsNewOpModalOpen(false)}
        operationData={newOpModalData}
        onConfirm={handleConfirmOperation}
      />
      <ManageUsersModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        onViewUserOps={handleViewUserOps}
        setAlert={setAlert}
        onDeleteUser={handleDeleteUser}
      />
      <UserOperationsModal
        isOpen={isUserOpsModalOpen}
        onClose={() => setIsUserOpsModalOpen(false)}
        user={currentUserForOps}
        onUpdateOperation={handleUpdateOperation}
        setAlert={setAlert}
      />
      <OperationDetailsModal
        isOpen={isOpDetailsModalOpen}
        onClose={() => setIsOpDetailsModalOpen(false)}
        operation={currentOpDetails?.op}
        profit={currentOpDetails?.profit}
      />
      <ManageLeverageModal
        isOpen={isLeverageModalOpen}
        onClose={() => setIsLeverageModalOpen(false)}
        setAlert={setAlert}
      />
      {/* NUEVO: Renderizado del modal de comisiones */}
      <ManageCommissionsModal
        isOpen={isCommissionsModalOpen}
        onClose={() => setIsCommissionsModalOpen(false)}
        setAlert={setAlert}
      />
      {/* AÑADIDO: MODAL DE NOTIFICACIONES */}
      <ManageNotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        setAlert={setAlert}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        stats={stats}
      />

      <main className="flex-1 flex flex-col bg-transparent overflow-hidden">
        <Header
          onOperation={handleOpenNewOpModal}
          onManageUsers={() => setIsUsersModalOpen(true)}
          onManageLeverage={() => setIsLeverageModalOpen(true)}
          onManageCommissions={() => setIsCommissionsModalOpen(true)} // Nuevo handler
          onManageNotifications={() => setIsNotificationsModalOpen(true)}
          onToggleSideMenu={() => setIsSideMenuOpen(true)}
          onToggleMainSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />
        <div className="flex-1 flex flex-col p-2 sm:p-4 gap-4 overflow-y-auto pb-24 sm:pb-4">
          <div className="flex-grow min-h-[300px] sm:min-h-[400px] bg-white rounded-xl shadow-lg border border-gray-200">
            <TradingViewWidget symbol={selectedAsset} />
          </div>
          <FinancialMetrics
            metrics={displayMetrics}
            isLoading={isLoadingData}
          />
          <div className="h-full flex flex-col">
            <OperationsHistory
              operations={operations}
              setOperations={setOperations}
              filter={opHistoryFilter}
              setFilter={handleFilterChange}
              onRowClick={handleOpRowClick}
              isLoading={isLoadingData}
              pagination={pagination}
              onPageChange={handlePageChange}
              setAlert={setAlert}
            />
          </div>
        </div>
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-3 border-t border-gray-200 flex justify-around items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenNewOpModal("sell", mobileVolume)}
            className="flex-1 bg-red-600 hover:bg-red-500 transition-all text-white px-4 py-3 text-sm font-bold rounded-md"
          >
            SELL
          </motion.button>
          <input
            type="number"
            value={mobileVolume}
            onChange={(e) => setMobileVolume(parseFloat(e.target.value) || 0)}
            step="0.01"
            min="0.01"
            className="w-24 p-3 border border-gray-300 bg-gray-50 rounded-md text-gray-900 text-center text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenNewOpModal("buy", mobileVolume)}
            className="flex-1 bg-green-600 hover:bg-green-500 transition-all text-white px-4 py-3 text-sm font-bold rounded-md"
          >
            BUY
          </motion.button>
        </div>
      </main>
    </div>
  );
};

const ChangePasswordView = React.memo(({ onBack, setAlert }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setAlert({
        message: "Las contraseñas nuevas no coinciden.",
        type: "error",
      });
      return;
    }
    // Lógica para llamar a la API y cambiar la contraseña...
    setAlert({
      message: "Contraseña actualizada (simulación).",
      type: "success",
    });
  };

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="flex items-center text-indigo-600 hover:text-indigo-500 mb-4 cursor-pointer"
      >
        <Icons.ChevronLeft /> Volver
      </button>
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        Cambiar Contraseña
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Contraseña Actual
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Nueva Contraseña
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Confirmar Nueva Contraseña
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-md text-white font-bold bg-indigo-600 hover:bg-indigo-500 cursor-pointer transition-colors"
          >
            Actualizar Contraseña
          </button>
        </div>
      </form>
    </div>
  );
});

const ProfileModal = ({ isOpen, onClose, user, stats }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resumen de Perfil"
      maxWidth="max-w-md"
    >
      {user && stats && (
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-gray-900">
              {user.nombre}
            </h3>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">
              Teléfono: {user.telefono || "No especificado"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Balance</p>
              <p className="font-bold text-xl text-gray-900">
                ${parseFloat(user.balance).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Ganancia Total</p>
              <p
                className={`font-bold text-xl ${
                  parseFloat(stats.ganancia_total) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${parseFloat(stats.ganancia_total || 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Op. Abiertas</p>
              <p className="font-bold text-xl text-gray-900">
                {stats.abiertas || 0}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Op. Cerradas</p>
              <p className="font-bold text-xl text-gray-900">
                {stats.cerradas || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

const TradingVisual = () => {
  const AnimatedElement = motion.div;
  const numCandles = 20;

  // Parámetros de animación para los elementos de gráfico
  const lineAnimation = {
    initial: { pathLength: 0, opacity: 0.5 },
    animate: {
      pathLength: 1,
      opacity: 0.2,
      transition: {
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  };

  const candleAnimation = {
    animate: (i) => ({
      scaleY: [1, 0.5, 1.5, 1],
      y: [0, -10, 10, 0],
      backgroundColor:
        i % 2 === 0
          ? ["#10b981", "#ef4444", "#10b981"]
          : ["#ef4444", "#10b981", "#ef4444"],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.2,
      },
    }),
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
      {/* 1. Patrón de Cuadrícula de Fondo (Simula un gráfico) */}
      <div className="absolute inset-0 [background:repeating-linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:100%_25px] opacity-30" />
      <div className="absolute inset-0 [background:repeating-linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:10%_100%] opacity-30" />

      {/* 2. Gráfico de Líneas Animado (Línea de tendencia) */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,80 C 25,20 75,90 100,30"
          stroke="#a78bfa" // Púrpura
          strokeWidth="0.5"
          fill="none"
          variants={lineAnimation}
          initial="initial"
          animate="animate"
        />
        <motion.path
          d="M0,50 C 30,70 70,30 100,50"
          stroke="#10b981" // Verde
          strokeWidth="0.5"
          fill="none"
          variants={lineAnimation}
          initial="initial"
          animate="animate"
          style={{ transform: "translateY(10px)" }}
        />
      </svg>

      {/* 3. Velas de Trading Animadas */}
      <div className="absolute inset-0 flex justify-around items-end p-8 pb-12">
        {Array.from({ length: numCandles }).map((_, i) => (
          <AnimatedElement
            key={i}
            custom={i}
            variants={candleAnimation}
            animate="animate"
            className="w-1.5 h-16 origin-bottom rounded-sm shadow-md"
            style={{
              height: `${25 + i * 2}px`, // Altura inicial variada
              margin: `0 ${i % 3 === 0 ? "5px" : "1px"}`,
              zIndex: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// --- LOGIN/REGISTER ADAPTADO PARA UNIQUE 1 GLOBAL ---
const LoginPage = ({ onNavigate }) => {
  const { setUser, setIsAuthenticated } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleAuth = async (e, action) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const platform_id = VITE_PLATFORM_ID;

    if (action === "login") {
      try {
        const { data } = await axios.post("/login", {
          email: loginEmail,
          password: loginPassword,
          platform_id,
        });
        if (data.success && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setError(data.error || "Credenciales inválidas");
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "Ocurrió un error en el inicio de sesión."
        );
      }
    } else {
      // register
      try {
        const payload = {
          nombre: regName,
          email: regEmail,
          password: regPassword,
          platform_id,
        };
        const { data } = await axios.post("/register", payload);
        if (data.success) {
          setSuccess("Registro exitoso. Por favor, inicie sesión.");
          setIsLogin(true);
        } else {
          setError(data.error || "Error en el registro");
        }
      } catch (err) {
        setError(
          err.response?.data?.error || "Ocurrió un error en el registro."
        );
      }
    }
  };

  // CAMBIO: Se actualiza la variable para usar un logo blanco específico para el login.
  // Puedes cambiar "/unique1global-logo-white.png" por la ruta correcta de tu logo blanco.
  const platformLogo = VITE_PLATFORM_LOGO_WHITE;
  const formVariants = {
    hidden: { opacity: 0, x: 300 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
    exit: { opacity: 0, x: -300, transition: { ease: "easeInOut" } },
  };

  return (
    <div
      className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-cover bg-center"
      style={{
        // CAMBIO: Nuevo fondo abstracto con blanco predominante y toques de color.
        backgroundImage:
          "url('https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      <div className="relative w-full max-w-4xl min-h-[600px] bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
        <div
          className="w-full md:w-1/2 text-white p-8 sm:p-12 flex flex-col justify-center items-center text-center bg-gradient-to-br from-purple-600 to-purple-800"
          style={{
            background: "linear-gradient(to bottom right, #5D1BC7, #410093)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <img
              src={platformLogo}
              alt="Logo de la Plataforma"
              className="w-40 sm:w-48 mx-auto mb-4"
            />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {isLogin ? "¡Bienvenido de Nuevo!" : "Crea tu Cuenta"}
            </h1>
            <p className="mb-6 text-sm sm:text-base">
              {isLogin
                ? "Para seguir conectado, por favor inicia sesión con tu información personal."
                : "Ingresa tus datos para comenzar tu viaje con nosotros."}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              className="bg-white/20 hover:bg-white/30 font-bold py-2 px-6 rounded-full transition-all"
            >
              {isLogin ? "Registrarse" : "Iniciar Sesión"}
            </button>
          </motion.div>
        </div>
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
                  Iniciar Sesión
                </h2>
                {error && (
                  <p className="text-red-500 text-center text-sm mb-4">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-green-500 text-center text-sm mb-4">
                    {success}
                  </p>
                )}
                <form
                  onSubmit={(e) => handleAuth(e, "login")}
                  className="space-y-4"
                >
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full p-3 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full p-3 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
                    style={{ backgroundColor: "#410093" }}
                  >
                    Entrar
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
                  Crear Cuenta
                </h2>
                {error && (
                  <p className="text-red-500 text-center text-sm mb-2">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-green-500 text-center text-sm mb-2">
                    {success}
                  </p>
                )}
                <form
                  onSubmit={(e) => handleAuth(e, "register")}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    placeholder="Nombre Completo"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full p-2 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full p-2 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-2 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
                    style={{ backgroundColor: "#410093" }}
                  >
                    Crear Cuenta
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => onNavigate("landing")}
            className="text-center text-sm text-purple-600 hover:underline mt-4"
          >
            &larr; Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

// --- NUEVO COMPONENTE: Página de Políticas (Con el estilo del Landing) ---
const PoliciesPage = ({ onNavigate }) => {
  const platformLogo = VITE_PLATFORM_LOGO;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header reutilizado de Landing */}
      <header className="flex-shrink-0 sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-md z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <button
            onClick={() => onNavigate("landing")}
            className="cursor-pointer"
          >
            <img src={platformLogo} alt="Logo" className="h-8" />
          </button>
          <button
            onClick={() => onNavigate("login")}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg"
            style={{ backgroundColor: "#410093" }}
          >
            Login / Registro
          </button>
        </div>
      </header>

      {/* Contenido principal (Simulando una sección del landing) */}
      <main className="flex-grow py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200"
          >
            <MarkdownRenderer content={POLICY_MARKDOWN} />
            <button
              onClick={() => onNavigate("landing")}
              className="mt-8 flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-colors"
            >
              <Icons.ChevronLeft /> Volver al Inicio
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer reutilizado de Landing */}
      <footer className="flex-shrink-0 bg-gray-800 text-white py-6">
        <div className="container mx-auto px-6 text-center text-sm">
          <p className="mb-2">
            &copy; {new Date().getFullYear()} Unique 1 Global. Todos los
            derechos reservados.
          </p>
          <span className="text-white mb-2 cursor-default">
            Políticas y Condiciones
          </span>
          <p className="text-gray-400 mt-2">
            El trading implica riesgos. Invierte de manera responsable.
          </p>
        </div>
      </footer>
    </div>
  );
};

// --- Antiguo: Página de Inicio (Landing Page) ---
const LandingPage = ({ onNavigate }) => {
  const platformLogo = VITE_PLATFORM_LOGO;

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // FUNCIÓN MODIFICADA: Ahora navega al nuevo componente PoliciesPage
  const openPolicies = () => {
    onNavigate("policies");
  };

  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-md z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <img src={platformLogo} alt="Logo" className="h-8" />
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection("inicio")}
              className="hover:text-purple-600 transition-colors"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection("ventajas")}
              className="hover:text-purple-600 transition-colors"
            >
              ¿Por Qué?
            </button>
            <button
              onClick={() => scrollToSection("mercados")}
              className="hover:text-purple-600 transition-colors"
            >
              Mercados
            </button>
            <button
              onClick={() => scrollToSection("testimonios")}
              className="hover:text-purple-600 transition-colors"
            >
              Testimonios
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="hover:text-purple-600 transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection("contacto")}
              className="hover:text-purple-600 transition-colors"
            >
              Contacto
            </button>
          </nav>
          <button
            onClick={() => onNavigate("login")}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg"
            style={{ backgroundColor: "#410093" }}
          >
            Login / Registro
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="inicio"
        className="relative min-h-screen pt-24 pb-16 bg-gray-900 overflow-hidden flex items-center justify-center text-white"
      >
        {/* Elemento Dinámico con Movimiento (Fondo de Trading) */}
        <TradingVisual />

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-4"
          >
            Tu Puerta de Acceso a los Mercados Financieros
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 font-medium"
          >
            Descubre una experiencia de trading superior. Opera con acciones,
            Forex, criptomonedas y más, con herramientas avanzadas y una
            ejecución ultra rápida.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => onNavigate("login")}
            className="bg-white hover:bg-gray-200 text-purple-600 font-bold py-3 px-8 rounded-lg text-lg transition-colors shadow-xl"
            style={{
              color: "#410093",
            }} /* Asegura el color púrpura del texto */
          >
            Comienza a Operar Ahora{" "}
            <Icons.ArrowRight className="inline-block h-5 w-5 ml-2" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-8 text-gray-200 font-medium"
          >
            <div className="flex items-center gap-2">
              <Icons.ShieldCheck className="h-5 w-5 text-green-400" />
              <span>Plataforma Segura</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Banknotes className="h-5 w-5 text-green-400" />
              <span>Comisiones Bajas</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.UserGroup className="h-5 w-5 text-green-400" />
              <span>Soporte 24/7</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sección 2: Por Qué Elegirnos - Ventajas Únicas */}
      <section id="ventajas" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
              La Diferencia
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              La Plataforma que Entiende al Trader
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Icons.CurrencyDollar className="h-10 w-10 text-green-600 mb-3" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Comisiones Transparentes y Bajas
              </h3>
              <p className="text-gray-600 text-sm">
                Nuestra estructura de costos incluye spreads mínimos y
                comisiones claras, asegurando que retengas la mayor parte de tus
                ganancias.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Icons.Key className="h-10 w-10 text-indigo-600 mb-3" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Apalancamiento Flexible
              </h3>
              <p className="text-gray-600 text-sm">
                Ofrecemos opciones de apalancamiento competitivo (hasta 1:200),
                permitiéndote maximizar tu potencial de trading con gestión de
                riesgo integrada.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Icons.ShieldCheck className="h-10 w-10 text-red-600 mb-3" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Control Total de Riesgo
              </h3>
              <p className="text-gray-600 text-sm">
                Configura Take Profit y Stop Loss automáticos antes de confirmar
                cada operación. Tus posiciones se cierran sin intervención
                manual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Nosotros Section */}
      <section id="nosotros" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Diseñada para el Trader Moderno
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combinamos tecnología de punta, seguridad robusta y una amplia
              gama de mercados para ofrecerte la experiencia de trading
              definitiva.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <Icons.ShieldCheck className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Seguridad Inquebrantable
              </h3>
              <p className="text-gray-600">
                Operamos con los más altos estándares. Tus fondos e información
                personal están protegidos por encriptación avanzada y protocolos
                robustos.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <Icons.CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Un Universo de Activos</h3>
              <p className="text-gray-600">
                Desde divisas y acciones hasta las criptomonedas más volátiles.
                Diversifica tu portafolio sin salir de nuestra plataforma.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <Icons.Adjustments className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Ejecución y Herramientas Pro
              </h3>
              <p className="text-gray-600">
                Aprovecha nuestra ejecución de baja latencia, gráficos en tiempo
                real y un conjunto completo de herramientas de análisis para
                tomar decisiones informadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 4: Mercados Destacados */}
      <section id="mercados" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
              Cobertura Global
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Opera en los Mercados más Relevantes
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            <div className="p-4 bg-white rounded-xl text-center shadow-md">
              <p className="text-2xl font-bold text-purple-600">Forex</p>
              <p className="text-sm text-gray-600">EUR/USD, GBP/JPY</p>
            </div>
            <div className="p-4 bg-white rounded-xl text-center shadow-md">
              <p className="text-2xl font-bold text-purple-600">Cripto</p>
              <p className="text-sm text-gray-600">BTC, ETH, SOL</p>
            </div>
            <div className="p-4 bg-white rounded-xl text-center shadow-md">
              <p className="text-2xl font-bold text-purple-600">Metales</p>
              <p className="text-sm text-gray-600">Oro (XAU), Plata (XAG)</p>
            </div>
            <div className="p-4 bg-white rounded-xl text-center shadow-md">
              <p className="text-2xl font-bold text-purple-600">Acciones</p>
              <p className="text-sm text-gray-600">AAPL, NVDA, TSLA</p>
            </div>
            <div className="p-4 bg-white rounded-xl text-center shadow-md">
              <p className="text-2xl font-bold text-purple-600">Índices</p>
              <p className="text-sm text-gray-600">S&P 500, DAX</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => scrollToSection("caracteristicas")}
              className="text-purple-600 hover:text-purple-700 font-semibold transition-colors flex items-center mx-auto"
            >
              Explora más funcionalidades{" "}
              <Icons.ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </section>
      {/* Sección 6: Preguntas Frecuentes (FAQ) */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
              Resolvemos tus Dudas
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Preguntas Frecuentes
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "¿Qué es el Apalancamiento y cómo se usa?",
                a: "El apalancamiento te permite abrir posiciones más grandes usando una cantidad pequeña de tu capital (margen). En nuestra plataforma, puedes elegir apalancamiento hasta 1:200, pero recuerda que amplifica tanto las ganancias como las pérdidas.",
              },
              {
                q: "¿Cómo se calculan las Comisiones y los Spreads?",
                a: "La Comisión se cobra al abrir la operación (porcentaje del volumen nocional) y se resta de tu balance. El Spread es el diferencial entre el precio de compra y venta, que se integra en el precio de entrada de tu operación.",
              },
              {
                q: "¿Qué sucede con mis operaciones durante la noche?",
                a: "Las operaciones abiertas durante la noche incurren en un Swap (interés nocturno), que se cobra diariamente sobre el capital que tienes invertido (margen). Este costo se aplica automáticamente a tu balance.",
              },
              {
                q: "¿Qué activos puedo operar?",
                a: "Ofrecemos una amplia gama de instrumentos, incluyendo los principales pares de Forex (EUR/USD, GBP/JPY), Criptomonedas (BTC, ETH), Acciones e Índices globales.",
              },
            ].map((item, index) => (
              <details
                key={index}
                className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center">
                  {item.q}
                  <span className="text-purple-600 ml-2">
                    <Icons.Plus className="h-5 w-5" />
                  </span>
                </summary>
                <p className="mt-3 text-sm text-gray-600 border-t border-gray-200 pt-3">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Sección 5: Testimonios y Prueba Social */}
      <section id="testimonios" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
              Nuestros Traders Hablan
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              La Confianza de la Comunidad
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl shadow-lg border border-gray-200">
              <p className="text-gray-700 italic mb-4">
                "La ejecución es impecable y la plataforma es increíblemente
                intuitiva. Pude configurar mis TP y SL rápidamente, lo cual es
                vital para mi estrategia."
              </p>
              <p className="font-bold text-gray-900">— Javier M.</p>
              <p className="text-sm text-purple-600">Trader de Forex</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl shadow-lg border border-gray-200">
              <p className="text-gray-700 italic mb-4">
                "El control de margen y las comisiones claras me dan la
                tranquilidad que necesito. Es la plataforma más transparente que
                he usado para cripto."
              </p>
              <p className="font-bold text-gray-900">— Sofía R.</p>
              <p className="text-sm text-purple-600">
                Inversora en Criptomonedas
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl shadow-lg border border-gray-200">
              <p className="text-gray-700 italic mb-4">
                "El soporte fue excelente cuando tuve dudas sobre el
                apalancamiento. Recomiendo esta plataforma a cualquiera que
                busque herramientas serias."
              </p>
              <p className="font-bold text-gray-900">— Andrés C.</p>
              <p className="text-sm text-purple-600">Analista de Acciones</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para Empezar?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Únete a miles de traders que confían en nosotros. Abre tu cuenta hoy
            mismo.
          </p>
          <button
            onClick={() => onNavigate("login")}
            className="bg-white hover:bg-gray-200 text-purple-600 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Abrir Cuenta
          </button>
        </div>
      </section>

      {/* Footer (Añadido el botón de Políticas) */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-6 text-center text-sm">
          <p className="mb-2">
            &copy; {new Date().getFullYear()} Unique 1 Global. Todos los
            derechos reservados.
          </p>
          <button
            onClick={openPolicies}
            className="text-gray-400 hover:text-white transition-colors underline mb-2"
          >
            Políticas y Condiciones
          </button>
          <p className="text-gray-400 mt-2">
            El trading implica riesgos. Invierte de manera responsable.
          </p>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  // CORRECCIÓN CRÍTICA: Se debe importar 'globalNotification' para usarlo en el scope.
  const { isAppLoading, isAuthenticated, globalNotification } =
    useContext(AppContext);
  const [currentView, setCurrentView] = useState("landing");

  const platformLogo = VITE_PLATFORM_LOGO;

  // AÑADIDO: Función para calcular padding basado en la notificación
  const getDashboardPadding = () => {
    // Si hay notificación global, añade padding superior.
    return globalNotification ? "pt-16" : "pt-0";
  };

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-bold animate-pulse">
          <img src={platformLogo} width="220" alt="Cargando..." />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // APLICACIÓN DEL PADDING DINÁMICO Y EL BANNER
    return (
      <div className={`h-screen ${getDashboardPadding()}`}>
        <GlobalNotificationBanner />
        <DashboardPage />
      </div>
    );
  }

  switch (currentView) {
    case "login":
      return <LoginPage onNavigate={setCurrentView} />;
    case "policies": // NUEVA RUTA
      return <PoliciesPage onNavigate={setCurrentView} />;
    case "landing":
    default:
      return <LandingPage onNavigate={setCurrentView} />;
  }
};

export default function Root() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
