/* Global Market — datos compartidos entre la tienda y el panel del encargado.
   Se guardan en el navegador (localStorage). Para que todos los clientes vean
   lo mismo desde sus celulares, luego se conecta una base de datos en línea. */
const GM = (() => {
  const KEY = "gm_data_v2"; // v2: catálogo ampliado (164 productos con imagen)
  const CART_KEY = "gm_cart_v1";

  const defaults = {
    config: {
      name: "Global Market",
      tagline: "Hogar, organizadores y accesorios",
      whatsapp: "51999999999", // código de país + número, sin + ni espacios
      currency: "S/",
      email: "admin@globalmarket.com",
      password: "123456",
      passwordSet: false, // pasa a true cuando el encargado crea su propia contraseña
      heroTitle: "Todo para tu hogar en un solo lugar",
      heroText: "Elige lo que necesitas del catálogo y haz tu pedido por WhatsApp. Confirmamos la disponibilidad y coordinamos el pago y la entrega contigo.",
      heroImage1: "", // vacío = foto original del local
      heroImage2: "",
      address: "",   // opcional: lo muestra el pie de página y el asistente
      hours: "",     // opcional: horario de atención
      faqs: [
        { q: "¿Cómo hago mi pedido?", a: "Agrega los productos al carrito y presiona «Enviar pedido por WhatsApp». Te confirmamos la disponibilidad y coordinamos contigo el pago y la entrega." },
        { q: "¿Qué medios de pago aceptan?", a: "El pago se coordina por WhatsApp una vez confirmado tu pedido. Escríbenos y te indicamos las opciones disponibles." },
        { q: "¿Hacen envíos?", a: "La entrega se coordina contigo por WhatsApp según tu zona." },
        { q: "¿Los productos tienen stock?", a: "El catálogo muestra el stock disponible de cada producto. Si algo aparece agotado, escríbenos y te avisamos cuando vuelva a haber." }
      ]
    },
    categories: ["Hogar","Organizadores","Accesorios de cabello","Cocina","Limpieza","Tecnología","Peluches y juguetes","Accesorios","Perfumes","Cuidado personal"],
    products: [
      {"id":"p1","name":"Canasta organizadora con tapa","price":24.9,"category":"Organizadores","desc":"Ideal para ordenar ropa, juguetes o utensilios.","image":"img/productos/canasta-organizadora-con-tapa.svg","stock":10},
      {"id":"p2","name":"Cesto de ropa tejido","price":39.9,"category":"Hogar","desc":"Cesto ventilado, resistente y fácil de limpiar.","image":"img/productos/cesto-de-ropa-tejido.svg","stock":7},
      {"id":"p3","name":"Set de scrunchies de colores","price":9.9,"category":"Accesorios de cabello","desc":"Pack de colores variados, suaves con el cabello.","image":"img/productos/set-de-scrunchies-de-colores.svg","stock":27},
      {"id":"p4","name":"Diadema de spa","price":7.5,"category":"Accesorios de cabello","desc":"Para el cuidado facial y el maquillaje.","image":"img/productos/diadema-de-spa.svg","stock":4},
      {"id":"p5","name":"Organizador de cajones x6","price":18.5,"category":"Organizadores","desc":"Seis divisores ajustables para cajones.","image":"img/productos/organizador-de-cajones-x6.svg","stock":15},
      {"id":"p6","name":"Caja multiusos apilable","price":32,"category":"Organizadores","desc":"Caja resistente que se apila para ahorrar espacio.","image":"img/productos/caja-multiusos-apilable.svg","stock":3},
      {"id":"p7","name":"Juego de toallas de cocina x3","price":14.9,"category":"Cocina","desc":"Algodón absorbente, tres diseños.","image":"img/productos/juego-de-toallas-de-cocina-x3.svg","stock":17},
      {"id":"p8","name":"Set de tapers herméticos x5","price":29.9,"category":"Cocina","desc":"Aptos para microondas y congelador.","image":"img/productos/set-de-tapers-hermeticos-x5.svg","stock":8},
      {"id":"p9","name":"Escurridor de platos plegable","price":35,"category":"Cocina","desc":"Se pliega para guardarlo fácilmente.","image":"img/productos/escurridor-de-platos-plegable.svg","stock":0},
      {"id":"p10","name":"Espejo decorativo redondo","price":59.9,"category":"Hogar","desc":"Marco metálico dorado de 40 cm.","image":"img/productos/espejo-decorativo-redondo.svg","stock":6},
      {"id":"p11","name":"Cojín decorativo","price":22,"category":"Hogar","desc":"Funda lavable con relleno suave.","image":"img/productos/cojin-decorativo.svg","stock":14},
      {"id":"p12","name":"Peineta y cepillo desenredante","price":12.5,"category":"Accesorios de cabello","desc":"Para cabello seco o mojado.","image":"img/productos/peineta-y-cepillo-desenredante.svg","stock":5},
      {"id":"p13","name":"Limpiador multiuso 1 L","price":8.9,"category":"Limpieza","desc":"Aroma cítrico, para todas las superficies.","image":"img/productos/limpiador-multiuso-1-l.svg","stock":38},
      {"id":"p14","name":"Set de esponjas x6","price":6.5,"category":"Limpieza","desc":"Esponjas de doble cara.","image":"img/productos/set-de-esponjas-x6.svg","stock":2},
      {"id":"p15","name":"Manta polar suave 1.5 m","price":39.9,"category":"Hogar","desc":"Manta cálida y suave para el sofá o la cama.","image":"img/productos/manta-polar-suave-1-5-m.svg","stock":18},
      {"id":"p16","name":"Fundas de almohada x2","price":19.9,"category":"Hogar","desc":"Par de fundas lavables, fáciles de planchar.","image":"img/productos/fundas-de-almohada-x2.svg","stock":28},
      {"id":"p17","name":"Cortina blackout 140 x 220 cm","price":45,"category":"Hogar","desc":"Bloquea la luz del sol y da privacidad.","image":"img/productos/cortina-blackout-140-x-220-cm.svg","stock":12},
      {"id":"p18","name":"Alfombra antideslizante de baño","price":24.9,"category":"Hogar","desc":"Absorbente, con base de goma que no resbala.","image":"img/productos/alfombra-antideslizante-de-bano.svg","stock":40},
      {"id":"p19","name":"Reloj de pared minimalista","price":29.9,"category":"Hogar","desc":"Diseño silencioso de 30 cm, ideal para sala o cocina.","image":"img/productos/reloj-de-pared-minimalista.svg","stock":4},
      {"id":"p20","name":"Lámpara de mesa LED","price":34.9,"category":"Hogar","desc":"Luz cálida regulable con base estable.","image":"img/productos/lampara-de-mesa-led.svg","stock":8},
      {"id":"p21","name":"Velas aromáticas x3","price":16.9,"category":"Hogar","desc":"Tres fragancias relajantes para ambientar tu casa.","image":"img/productos/velas-aromaticas-x3.svg","stock":2},
      {"id":"p22","name":"Florero de cerámica","price":22.5,"category":"Hogar","desc":"Florero decorativo de acabado mate.","image":"img/productos/florero-de-ceramica.svg","stock":18},
      {"id":"p23","name":"Planta artificial decorativa","price":18.9,"category":"Hogar","desc":"Parece natural, no necesita riego ni luz.","image":"img/productos/planta-artificial-decorativa.svg","stock":4},
      {"id":"p24","name":"Marco de fotos 15 x 20 cm","price":11.9,"category":"Hogar","desc":"Marco de plástico resistente, para pared o mesa.","image":"img/productos/marco-de-fotos-15-x-20-cm.svg","stock":25},
      {"id":"p25","name":"Ganchos adhesivos x10","price":6.9,"category":"Hogar","desc":"Se pegan sin taladro y soportan hasta 3 kg.","image":"img/productos/ganchos-adhesivos-x10.svg","stock":28},
      {"id":"p26","name":"Perchas antideslizantes x10","price":12.9,"category":"Hogar","desc":"Perchas delgadas que ahorran espacio en el clóset.","image":"img/productos/perchas-antideslizantes-x10.svg","stock":4},
      {"id":"p27","name":"Tendedero plegable de ropa","price":38,"category":"Hogar","desc":"Estructura de metal con varias barras, se pliega.","image":"img/productos/tendedero-plegable-de-ropa.svg","stock":10},
      {"id":"p28","name":"Luz nocturna con sensor","price":14.9,"category":"Hogar","desc":"Se enciende sola cuando oscurece, bajo consumo.","image":"img/productos/luz-nocturna-con-sensor.svg","stock":10},
      {"id":"p29","name":"Felpudo de entrada","price":21.9,"category":"Hogar","desc":"Base antideslizante y tela que atrapa la suciedad.","image":"img/productos/felpudo-de-entrada.svg","stock":4},
      {"id":"p30","name":"Cubrecama 2 plazas con relleno","price":59.9,"category":"Hogar","desc":"Tela suave y acolchada, para toda temporada.","image":"img/productos/cubrecama-2-plazas-con-relleno.svg","stock":4},
      {"id":"p31","name":"Portavasos de silicona x6","price":8.9,"category":"Hogar","desc":"Protegen tus muebles de manchas y calor.","image":"img/productos/portavasos-de-silicona-x6.svg","stock":2},
      {"id":"p32","name":"Difusor de aroma ultrasónico","price":42,"category":"Hogar","desc":"Humidifica y perfuma el ambiente con luz LED.","image":"img/productos/difusor-de-aroma-ultrasonico.svg","stock":15},
      {"id":"p33","name":"Juego de cuchillos x5","price":39.9,"category":"Cocina","desc":"Cinco cuchillos de acero inoxidable con base.","image":"img/productos/juego-de-cuchillos-x5.svg","stock":12},
      {"id":"p34","name":"Tabla de picar de bambú","price":19.9,"category":"Cocina","desc":"Resistente, fácil de lavar y de buen tamaño.","image":"img/productos/tabla-de-picar-de-bambu.svg","stock":30},
      {"id":"p35","name":"Sartén antiadherente 24 cm","price":34.9,"category":"Cocina","desc":"Cocina con poco aceite, mango anticalor.","image":"img/productos/sarten-antiadherente-24-cm.svg","stock":2},
      {"id":"p36","name":"Olla con tapa de vidrio 20 cm","price":44.9,"category":"Cocina","desc":"Aluminio con recubrimiento antiadherente.","image":"img/productos/olla-con-tapa-de-vidrio-20-cm.svg","stock":5},
      {"id":"p37","name":"Juego de cubiertos x24","price":49.9,"category":"Cocina","desc":"Cucharas, tenedores y cuchillos en acero inoxidable.","image":"img/productos/juego-de-cubiertos-x24.svg","stock":4},
      {"id":"p38","name":"Taza de cerámica con tapa","price":12.9,"category":"Cocina","desc":"Taza de 350 ml con tapa y cucharita.","image":"img/productos/taza-de-ceramica-con-tapa.svg","stock":40},
      {"id":"p39","name":"Vasos de vidrio x6","price":18.9,"category":"Cocina","desc":"Set de seis vasos de 300 ml.","image":"img/productos/vasos-de-vidrio-x6.svg","stock":15},
      {"id":"p40","name":"Termo de acero 1 L","price":32.9,"category":"Cocina","desc":"Mantiene el calor hasta 12 horas.","image":"img/productos/termo-de-acero-1-l.svg","stock":15},
      {"id":"p41","name":"Botella deportiva 750 ml","price":14.9,"category":"Cocina","desc":"Libre de BPA, con tapa de seguridad.","image":"img/productos/botella-deportiva-750-ml.svg","stock":3},
      {"id":"p42","name":"Licuadora portátil recargable","price":59.9,"category":"Cocina","desc":"Prepara jugos y batidos en cualquier lugar.","image":"img/productos/licuadora-portatil-recargable.svg","stock":4},
      {"id":"p43","name":"Batidor de mano","price":7.9,"category":"Cocina","desc":"Batidor de acero con mango cómodo.","image":"img/productos/batidor-de-mano.svg","stock":3},
      {"id":"p44","name":"Rallador multiuso","price":9.9,"category":"Cocina","desc":"Cuatro caras de rallado, con base antideslizante.","image":"img/productos/rallador-multiuso.svg","stock":10},
      {"id":"p45","name":"Pelador de verduras","price":5.9,"category":"Cocina","desc":"Hoja afilada de acero inoxidable.","image":"img/productos/pelador-de-verduras.svg","stock":12},
      {"id":"p46","name":"Abrelatas y destapador","price":6.5,"category":"Cocina","desc":"Dos herramientas en una, mango ergonómico.","image":"img/productos/abrelatas-y-destapador.svg","stock":25},
      {"id":"p47","name":"Jarra medidora 1 L","price":10.9,"category":"Cocina","desc":"Plástico resistente con graduación visible.","image":"img/productos/jarra-medidora-1-l.svg","stock":50},
      {"id":"p48","name":"Colador de acero inoxidable","price":8.9,"category":"Cocina","desc":"Malla fina, ideal para pasta y arroz.","image":"img/productos/colador-de-acero-inoxidable.svg","stock":8},
      {"id":"p49","name":"Set de especieros x6","price":21.9,"category":"Cocina","desc":"Frascos con tapa dosificadora y etiquetas.","image":"img/productos/set-de-especieros-x6.svg","stock":20},
      {"id":"p50","name":"Escurridor de cubiertos","price":13.9,"category":"Cocina","desc":"Porta cubiertos con bandeja de drenaje.","image":"img/productos/escurridor-de-cubiertos.svg","stock":2},
      {"id":"p51","name":"Guantes de cocina anticalor","price":9.9,"category":"Cocina","desc":"Par de guantes de silicona, hasta 230 °C.","image":"img/productos/guantes-de-cocina-anticalor.svg","stock":4},
      {"id":"p52","name":"Moldes de silicona x6","price":17.9,"category":"Cocina","desc":"Para cupcakes, gelatina o hielo; no se pegan.","image":"img/productos/moldes-de-silicona-x6.svg","stock":3},
      {"id":"p53","name":"Escoba y recogedor","price":22.9,"category":"Limpieza","desc":"Set con recogedor de goma y mango largo.","image":"img/productos/escoba-y-recogedor.svg","stock":18},
      {"id":"p54","name":"Trapeador de microfibra","price":27.9,"category":"Limpieza","desc":"Cabezal giratorio y lavable.","image":"img/productos/trapeador-de-microfibra.svg","stock":4},
      {"id":"p55","name":"Balde con exprimidor","price":25.9,"category":"Limpieza","desc":"Balde de 12 L con escurridor integrado.","image":"img/productos/balde-con-exprimidor.svg","stock":4},
      {"id":"p56","name":"Paños de microfibra x5","price":9.9,"category":"Limpieza","desc":"Limpian sin rayar vidrios ni superficies.","image":"img/productos/panos-de-microfibra-x5.svg","stock":2},
      {"id":"p57","name":"Guantes de látex para limpieza","price":5.5,"category":"Limpieza","desc":"Resistentes, con interior suave.","image":"img/productos/guantes-de-latex-para-limpieza.svg","stock":28},
      {"id":"p58","name":"Detergente líquido 1 L","price":13.9,"category":"Limpieza","desc":"Cuida la ropa y deja buen aroma.","image":"img/productos/detergente-liquido-1-l.svg","stock":3},
      {"id":"p59","name":"Lejía 1 L","price":4.5,"category":"Limpieza","desc":"Blanquea y desinfecta.","image":"img/productos/lejia-1-l.svg","stock":12},
      {"id":"p60","name":"Desinfectante lavanda 900 ml","price":7.9,"category":"Limpieza","desc":"Elimina gérmenes y perfuma los pisos.","image":"img/productos/desinfectante-lavanda-900-ml.svg","stock":12},
      {"id":"p61","name":"Lavavajillas líquido 750 ml","price":6.9,"category":"Limpieza","desc":"Quita la grasa con poca cantidad.","image":"img/productos/lavavajillas-liquido-750-ml.svg","stock":20},
      {"id":"p62","name":"Limpiavidrios con gatillo","price":8.5,"category":"Limpieza","desc":"Deja vidrios y espejos sin marcas.","image":"img/productos/limpiavidrios-con-gatillo.svg","stock":18},
      {"id":"p63","name":"Ambientador en spray","price":9.5,"category":"Limpieza","desc":"Aroma floral de larga duración.","image":"img/productos/ambientador-en-spray.svg","stock":8},
      {"id":"p64","name":"Bolsas de basura x30","price":7.5,"category":"Limpieza","desc":"Bolsas resistentes de 50 L.","image":"img/productos/bolsas-de-basura-x30.svg","stock":4},
      {"id":"p65","name":"Cepillo de limpieza multiusos","price":6.9,"category":"Limpieza","desc":"Cerdas firmes para baño, cocina y ropa.","image":"img/productos/cepillo-de-limpieza-multiusos.svg","stock":0},
      {"id":"p66","name":"Quitamanchas para ropa 500 ml","price":11.9,"category":"Limpieza","desc":"Remueve manchas difíciles sin dañar la tela.","image":"img/productos/quitamanchas-para-ropa-500-ml.svg","stock":9},
      {"id":"p67","name":"Papel higiénico x12","price":15.9,"category":"Limpieza","desc":"Doble hoja, suave y resistente.","image":"img/productos/papel-higienico-x12.svg","stock":4},
      {"id":"p68","name":"Organizador de zapatos x6 pares","price":28.9,"category":"Organizadores","desc":"Estante apilable para ordenar tu calzado.","image":"img/productos/organizador-de-zapatos-x6-pares.svg","stock":9},
      {"id":"p69","name":"Organizador colgante para baño","price":19.9,"category":"Organizadores","desc":"Con varios bolsillos, se cuelga en la puerta.","image":"img/productos/organizador-colgante-para-bano.svg","stock":10},
      {"id":"p70","name":"Caja organizadora transparente","price":21.9,"category":"Organizadores","desc":"Ver el contenido sin abrirla, con tapa.","image":"img/productos/caja-organizadora-transparente.svg","stock":0},
      {"id":"p71","name":"Organizador de maquillaje acrílico","price":35.9,"category":"Organizadores","desc":"Compartimentos para brochas, labiales y más.","image":"img/productos/organizador-de-maquillaje-acrilico.svg","stock":3},
      {"id":"p72","name":"Organizador de cables","price":7.9,"category":"Organizadores","desc":"Clips y velcros para ordenar tus cables.","image":"img/productos/organizador-de-cables.svg","stock":20},
      {"id":"p73","name":"Bolsas al vacío x5","price":18.9,"category":"Organizadores","desc":"Reducen el volumen de ropa y frazadas.","image":"img/productos/bolsas-al-vacio-x5.svg","stock":12},
      {"id":"p74","name":"Estante organizador de cocina","price":26.9,"category":"Organizadores","desc":"De dos niveles, para frascos y especias.","image":"img/productos/estante-organizador-de-cocina.svg","stock":25},
      {"id":"p75","name":"Organizador de escritorio","price":17.9,"category":"Organizadores","desc":"Para lapiceros, notas y accesorios.","image":"img/productos/organizador-de-escritorio.svg","stock":5},
      {"id":"p76","name":"Ligas elásticas x50","price":4.9,"category":"Accesorios de cabello","desc":"Ligas suaves que no maltratan el cabello.","image":"img/productos/ligas-elasticas-x50.svg","stock":12},
      {"id":"p77","name":"Pinzas de cabello tipo garra x4","price":8.9,"category":"Accesorios de cabello","desc":"Sujeción firme para cabello largo o grueso.","image":"img/productos/pinzas-de-cabello-tipo-garra-x4.svg","stock":4},
      {"id":"p78","name":"Gorro de ducha","price":5.9,"category":"Accesorios de cabello","desc":"Impermeable y ajustable.","image":"img/productos/gorro-de-ducha.svg","stock":3},
      {"id":"p79","name":"Cintillos de tela x6","price":9.5,"category":"Accesorios de cabello","desc":"Colores variados, cómodos para todo el día.","image":"img/productos/cintillos-de-tela-x6.svg","stock":12},
      {"id":"p80","name":"Moño para peinados","price":6.5,"category":"Accesorios de cabello","desc":"Para hacer un moño perfecto en segundos.","image":"img/productos/mono-para-peinados.svg","stock":4},
      {"id":"p81","name":"Audífonos Bluetooth inalámbricos","price":49.9,"category":"Tecnología","desc":"Con estuche de carga y micrófono incorporado.","image":"img/productos/audifonos-bluetooth-inalambricos.svg","stock":10},
      {"id":"p82","name":"Audífonos con cable","price":12.9,"category":"Tecnología","desc":"Conector de 3.5 mm, micrófono y control de volumen.","image":"img/productos/audifonos-con-cable.svg","stock":5},
      {"id":"p83","name":"Audífonos gamer con micrófono","price":59.9,"category":"Tecnología","desc":"Sonido envolvente y luces LED.","image":"img/productos/audifonos-gamer-con-microfono.svg","stock":9},
      {"id":"p84","name":"Audífonos de diadema inalámbricos","price":44.9,"category":"Tecnología","desc":"Bluetooth, plegables y con almohadillas suaves.","image":"img/productos/audifonos-de-diadema-inalambricos.svg","stock":8},
      {"id":"p85","name":"Cargador de pared 20 W","price":24.9,"category":"Tecnología","desc":"Carga rápida para celulares y tablets.","image":"img/productos/cargador-de-pared-20-w.svg","stock":10},
      {"id":"p86","name":"Cable USB-C a USB-C 1 m","price":9.9,"category":"Tecnología","desc":"Carga y transferencia de datos.","image":"img/productos/cable-usb-c-a-usb-c-1-m.svg","stock":4},
      {"id":"p87","name":"Cable Lightning 1 m","price":12.9,"category":"Tecnología","desc":"Para carga y sincronización de iPhone.","image":"img/productos/cable-lightning-1-m.svg","stock":30},
      {"id":"p88","name":"Cable micro USB 1 m","price":6.9,"category":"Tecnología","desc":"Cable resistente para celulares y accesorios.","image":"img/productos/cable-micro-usb-1-m.svg","stock":3},
      {"id":"p89","name":"Power bank 10000 mAh","price":54.9,"category":"Tecnología","desc":"Dos puertos USB y luz indicadora.","image":"img/productos/power-bank-10000-mah.svg","stock":50},
      {"id":"p90","name":"Parlante Bluetooth portátil","price":39.9,"category":"Tecnología","desc":"Sonido potente, hasta 6 horas de uso.","image":"img/productos/parlante-bluetooth-portatil.svg","stock":12},
      {"id":"p91","name":"Mouse inalámbrico","price":22.9,"category":"Tecnología","desc":"Receptor USB y diseño ergonómico.","image":"img/productos/mouse-inalambrico.svg","stock":4},
      {"id":"p92","name":"Teclado USB","price":29.9,"category":"Tecnología","desc":"Teclado en español, teclas silenciosas.","image":"img/productos/teclado-usb.svg","stock":5},
      {"id":"p93","name":"Mouse pad grande","price":12.9,"category":"Tecnología","desc":"Base antideslizante y superficie suave.","image":"img/productos/mouse-pad-grande.svg","stock":5},
      {"id":"p94","name":"Memoria USB 32 GB","price":19.9,"category":"Tecnología","desc":"Compacta, compatible con PC y laptop.","image":"img/productos/memoria-usb-32-gb.svg","stock":2},
      {"id":"p95","name":"Memoria microSD 64 GB","price":24.9,"category":"Tecnología","desc":"Con adaptador, para celular y cámara.","image":"img/productos/memoria-microsd-64-gb.svg","stock":4},
      {"id":"p96","name":"Soporte de celular para escritorio","price":11.9,"category":"Tecnología","desc":"Ángulo ajustable, plegable.","image":"img/productos/soporte-de-celular-para-escritorio.svg","stock":25},
      {"id":"p97","name":"Soporte de celular para auto","price":15.9,"category":"Tecnología","desc":"Se fija al parabrisas o al tablero.","image":"img/productos/soporte-de-celular-para-auto.svg","stock":4},
      {"id":"p98","name":"Aro de luz con trípode","price":45,"category":"Tecnología","desc":"Tres tonos de luz, ideal para fotos y videos.","image":"img/productos/aro-de-luz-con-tripode.svg","stock":4},
      {"id":"p99","name":"Lámpara LED USB flexible","price":14.9,"category":"Tecnología","desc":"Cuello flexible, perfecta para laptop o lectura.","image":"img/productos/lampara-led-usb-flexible.svg","stock":2},
      {"id":"p100","name":"Reloj inteligente (smartwatch)","price":79.9,"category":"Tecnología","desc":"Notificaciones, pasos y ritmo cardíaco.","image":"img/productos/reloj-inteligente-smartwatch.svg","stock":15},
      {"id":"p101","name":"Cámara web HD","price":49.9,"category":"Tecnología","desc":"Con micrófono, para clases y reuniones.","image":"img/productos/camara-web-hd.svg","stock":25},
      {"id":"p102","name":"Vidrio templado para celular","price":5.9,"category":"Tecnología","desc":"Protege la pantalla de golpes y rayones.","image":"img/productos/vidrio-templado-para-celular.svg","stock":25},
      {"id":"p103","name":"Funda transparente para celular","price":7.9,"category":"Tecnología","desc":"Delgada, protege sin ocultar el diseño.","image":"img/productos/funda-transparente-para-celular.svg","stock":50},
      {"id":"p104","name":"Adaptador OTG USB-C","price":6.5,"category":"Tecnología","desc":"Conecta memorias y mouse a tu celular.","image":"img/productos/adaptador-otg-usb-c.svg","stock":2},
      {"id":"p105","name":"Ventilador USB de mano","price":17.9,"category":"Tecnología","desc":"Recargable, tres velocidades.","image":"img/productos/ventilador-usb-de-mano.svg","stock":2},
      {"id":"p106","name":"Peluche oso 30 cm","price":24.9,"category":"Peluches y juguetes","desc":"Suave y abrazable, con lazo.","image":"img/productos/peluche-oso-30-cm.svg","stock":2},
      {"id":"p107","name":"Peluche oso gigante 60 cm","price":59.9,"category":"Peluches y juguetes","desc":"El regalo perfecto, relleno esponjoso.","image":"img/productos/peluche-oso-gigante-60-cm.svg","stock":2},
      {"id":"p108","name":"Peluche conejo","price":22.9,"category":"Peluches y juguetes","desc":"Orejas largas y pelaje muy suave.","image":"img/productos/peluche-conejo.svg","stock":20},
      {"id":"p109","name":"Peluche unicornio","price":29.9,"category":"Peluches y juguetes","desc":"Con cuerno brillante y crin de colores.","image":"img/productos/peluche-unicornio.svg","stock":4},
      {"id":"p110","name":"Peluche perrito","price":21.9,"category":"Peluches y juguetes","desc":"Lavable, con ojos bordados seguros.","image":"img/productos/peluche-perrito.svg","stock":2},
      {"id":"p111","name":"Peluche gatito","price":21.9,"category":"Peluches y juguetes","desc":"Tierno compañero para dormir.","image":"img/productos/peluche-gatito.svg","stock":4},
      {"id":"p112","name":"Peluche panda","price":26.9,"category":"Peluches y juguetes","desc":"Relleno suave, de 35 cm.","image":"img/productos/peluche-panda.svg","stock":4},
      {"id":"p113","name":"Peluche dinosaurio","price":25.9,"category":"Peluches y juguetes","desc":"Colorido y divertido, para todas las edades.","image":"img/productos/peluche-dinosaurio.svg","stock":10},
      {"id":"p114","name":"Peluche pulpo reversible","price":27.9,"category":"Peluches y juguetes","desc":"Cambia de carita feliz a molesta.","image":"img/productos/peluche-pulpo-reversible.svg","stock":2},
      {"id":"p115","name":"Llavero de peluche","price":6.9,"category":"Peluches y juguetes","desc":"Pequeño y tierno, para mochila o llaves.","image":"img/productos/llavero-de-peluche.svg","stock":5},
      {"id":"p116","name":"Muñeca de moda con accesorios","price":19.9,"category":"Peluches y juguetes","desc":"Incluye vestido y accesorios.","image":"img/productos/muneca-de-moda-con-accesorios.svg","stock":10},
      {"id":"p117","name":"Autos de juguete x6","price":14.9,"category":"Peluches y juguetes","desc":"Set de autos de fricción coloridos.","image":"img/productos/autos-de-juguete-x6.svg","stock":12},
      {"id":"p118","name":"Bloques de construcción 100 piezas","price":29.9,"category":"Peluches y juguetes","desc":"Estimulan la creatividad, piezas compatibles.","image":"img/productos/bloques-de-construccion-100-piezas.svg","stock":2},
      {"id":"p119","name":"Pelota de goma","price":7.9,"category":"Peluches y juguetes","desc":"Rebota bien, ideal para jugar al aire libre.","image":"img/productos/pelota-de-goma.svg","stock":18},
      {"id":"p120","name":"Rompecabezas 100 piezas","price":12.9,"category":"Peluches y juguetes","desc":"Imágenes infantiles, cartón resistente.","image":"img/productos/rompecabezas-100-piezas.svg","stock":5},
      {"id":"p121","name":"Reloj de pulsera casual","price":29.9,"category":"Accesorios","desc":"Correa ajustable y diseño clásico.","image":"img/productos/reloj-de-pulsera-casual.svg","stock":30},
      {"id":"p122","name":"Lentes de sol unisex","price":19.9,"category":"Accesorios","desc":"Protección UV400, marco liviano.","image":"img/productos/lentes-de-sol-unisex.svg","stock":3},
      {"id":"p123","name":"Collar con dije","price":12.9,"category":"Accesorios","desc":"Cadena fina con dije elegante.","image":"img/productos/collar-con-dije.svg","stock":2},
      {"id":"p124","name":"Pulsera de acero","price":14.9,"category":"Accesorios","desc":"Acero inoxidable que no se oxida.","image":"img/productos/pulsera-de-acero.svg","stock":5},
      {"id":"p125","name":"Aretes de acero x3 pares","price":9.9,"category":"Accesorios","desc":"Tres diseños distintos, hipoalergénicos.","image":"img/productos/aretes-de-acero-x3-pares.svg","stock":40},
      {"id":"p126","name":"Anillo ajustable","price":7.9,"category":"Accesorios","desc":"Se adapta a cualquier dedo.","image":"img/productos/anillo-ajustable.svg","stock":15},
      {"id":"p127","name":"Billetera de cuero sintético","price":24.9,"category":"Accesorios","desc":"Con varios compartimentos para tarjetas.","image":"img/productos/billetera-de-cuero-sintetico.svg","stock":18},
      {"id":"p128","name":"Mochila casual","price":49.9,"category":"Accesorios","desc":"Espaciosa, con bolsillo para laptop.","image":"img/productos/mochila-casual.svg","stock":5},
      {"id":"p129","name":"Cartera de mano","price":39.9,"category":"Accesorios","desc":"Cierre seguro y correa desmontable.","image":"img/productos/cartera-de-mano.svg","stock":5},
      {"id":"p130","name":"Cinturón de cuero sintético","price":19.9,"category":"Accesorios","desc":"Hebilla metálica y ajuste a medida.","image":"img/productos/cinturon-de-cuero-sintetico.svg","stock":20},
      {"id":"p131","name":"Gorra deportiva","price":17.9,"category":"Accesorios","desc":"Tela transpirable y tamaño regulable.","image":"img/productos/gorra-deportiva.svg","stock":15},
      {"id":"p132","name":"Bufanda tejida","price":18.9,"category":"Accesorios","desc":"Abrigadora y suave al tacto.","image":"img/productos/bufanda-tejida.svg","stock":25},
      {"id":"p133","name":"Paraguas plegable","price":16.9,"category":"Accesorios","desc":"Compacto, resistente al viento.","image":"img/productos/paraguas-plegable.svg","stock":6},
      {"id":"p134","name":"Cosmetiquera","price":12.9,"category":"Accesorios","desc":"Con cierre y forro impermeable.","image":"img/productos/cosmetiquera.svg","stock":10},
      {"id":"p135","name":"Perfume floral para dama 100 ml","price":39.9,"category":"Perfumes","desc":"Fragancia fresca de flores blancas.","image":"img/productos/perfume-floral-para-dama-100-ml.svg","stock":40},
      {"id":"p136","name":"Perfume cítrico para caballero 100 ml","price":39.9,"category":"Perfumes","desc":"Aroma fresco y energizante.","image":"img/productos/perfume-citrico-para-caballero-100-ml.svg","stock":5},
      {"id":"p137","name":"Perfume amaderado para caballero 100 ml","price":44.9,"category":"Perfumes","desc":"Notas de madera y especias.","image":"img/productos/perfume-amaderado-para-caballero-100-ml.svg","stock":18},
      {"id":"p138","name":"Perfume de vainilla para dama 100 ml","price":42.9,"category":"Perfumes","desc":"Dulce y cálido, de larga duración.","image":"img/productos/perfume-de-vainilla-para-dama-100-ml.svg","stock":20},
      {"id":"p139","name":"Body splash frutal 236 ml","price":24.9,"category":"Perfumes","desc":"Notas de frutos rojos, ligero y fresco.","image":"img/productos/body-splash-frutal-236-ml.svg","stock":4},
      {"id":"p140","name":"Body splash de vainilla 236 ml","price":24.9,"category":"Perfumes","desc":"Aroma dulce para todos los días.","image":"img/productos/body-splash-de-vainilla-236-ml.svg","stock":2},
      {"id":"p141","name":"Colonia fresca para niños 120 ml","price":19.9,"category":"Perfumes","desc":"Aroma suave, apta para piel sensible.","image":"img/productos/colonia-fresca-para-ninos-120-ml.svg","stock":10},
      {"id":"p142","name":"Perfume de bolsillo 30 ml x2","price":16.9,"category":"Perfumes","desc":"Dos mini perfumes para llevar en la cartera.","image":"img/productos/perfume-de-bolsillo-30-ml-x2.svg","stock":5},
      {"id":"p143","name":"Set de perfumes miniatura x4","price":34.9,"category":"Perfumes","desc":"Cuatro fragancias distintas en presentación de regalo.","image":"img/productos/set-de-perfumes-miniatura-x4.svg","stock":5},
      {"id":"p144","name":"Perfume unisex aroma marino 100 ml","price":36.9,"category":"Perfumes","desc":"Brisa de mar y notas frescas.","image":"img/productos/perfume-unisex-aroma-marino-100-ml.svg","stock":2},
      {"id":"p145","name":"Perfume oriental para dama 100 ml","price":46.9,"category":"Perfumes","desc":"Ámbar y especias, aroma intenso.","image":"img/productos/perfume-oriental-para-dama-100-ml.svg","stock":6},
      {"id":"p146","name":"Aceite perfumado roll-on 10 ml","price":12.9,"category":"Perfumes","desc":"Fragancia concentrada, práctica de llevar.","image":"img/productos/aceite-perfumado-roll-on-10-ml.svg","stock":15},
      {"id":"p147","name":"Agua de colonia clásica 250 ml","price":22.9,"category":"Perfumes","desc":"Aroma fresco de uso diario.","image":"img/productos/agua-de-colonia-clasica-250-ml.svg","stock":0},
      {"id":"p148","name":"Aromatizante para auto","price":7.9,"category":"Perfumes","desc":"Fragancia de larga duración, clip para rejilla.","image":"img/productos/aromatizante-para-auto.svg","stock":15},
      {"id":"p149","name":"Set de regalo perfume y body mist","price":59.9,"category":"Perfumes","desc":"Perfume de 50 ml + body mist de 100 ml.","image":"img/productos/set-de-regalo-perfume-y-body-mist.svg","stock":18},
      {"id":"p150","name":"Shampoo anticaspa 400 ml","price":14.9,"category":"Cuidado personal","desc":"Controla la caspa y refresca el cuero cabelludo.","image":"img/productos/shampoo-anticaspa-400-ml.svg","stock":50},
      {"id":"p151","name":"Shampoo de keratina 400 ml","price":16.9,"category":"Cuidado personal","desc":"Nutre y da brillo al cabello maltratado.","image":"img/productos/shampoo-de-keratina-400-ml.svg","stock":40},
      {"id":"p152","name":"Shampoo de sábila 400 ml","price":13.9,"category":"Cuidado personal","desc":"Hidrata y fortalece desde la raíz.","image":"img/productos/shampoo-de-sabila-400-ml.svg","stock":12},
      {"id":"p153","name":"Acondicionador hidratante 400 ml","price":14.9,"category":"Cuidado personal","desc":"Suaviza y facilita el peinado.","image":"img/productos/acondicionador-hidratante-400-ml.svg","stock":3},
      {"id":"p154","name":"Crema para peinar 250 ml","price":11.9,"category":"Cuidado personal","desc":"Define y controla el frizz sin dejar grasa.","image":"img/productos/crema-para-peinar-250-ml.svg","stock":50},
      {"id":"p155","name":"Mascarilla capilar de argán 300 g","price":18.9,"category":"Cuidado personal","desc":"Tratamiento intensivo para cabello seco.","image":"img/productos/mascarilla-capilar-de-argan-300-g.svg","stock":50},
      {"id":"p156","name":"Jabón líquido de manos 500 ml","price":8.9,"category":"Cuidado personal","desc":"Con aroma suave y glicerina.","image":"img/productos/jabon-liquido-de-manos-500-ml.svg","stock":50},
      {"id":"p157","name":"Jabón de tocador x3","price":6.9,"category":"Cuidado personal","desc":"Tres barras de jabón humectante.","image":"img/productos/jabon-de-tocador-x3.svg","stock":2},
      {"id":"p158","name":"Gel de ducha 500 ml","price":12.9,"category":"Cuidado personal","desc":"Espuma cremosa y aroma fresco.","image":"img/productos/gel-de-ducha-500-ml.svg","stock":4},
      {"id":"p159","name":"Crema corporal hidratante 400 ml","price":15.9,"category":"Cuidado personal","desc":"Absorción rápida, piel suave por 24 horas.","image":"img/productos/crema-corporal-hidratante-400-ml.svg","stock":4},
      {"id":"p160","name":"Desodorante roll-on x2","price":9.9,"category":"Cuidado personal","desc":"Protección de 48 horas, no mancha.","image":"img/productos/desodorante-roll-on-x2.svg","stock":8},
      {"id":"p161","name":"Pasta dental 100 ml","price":5.5,"category":"Cuidado personal","desc":"Protección anticaries y aliento fresco.","image":"img/productos/pasta-dental-100-ml.svg","stock":3},
      {"id":"p162","name":"Cepillos de dientes x4","price":8.9,"category":"Cuidado personal","desc":"Cerdas suaves, mango ergonómico.","image":"img/productos/cepillos-de-dientes-x4.svg","stock":2},
      {"id":"p163","name":"Protector solar FPS 50","price":24.9,"category":"Cuidado personal","desc":"Alta protección, textura ligera.","image":"img/productos/protector-solar-fps-50.svg","stock":2},
      {"id":"p164","name":"Toallas húmedas x80","price":6.9,"category":"Cuidado personal","desc":"Suaves y sin alcohol, para toda la familia.","image":"img/productos/toallas-humedas-x80.svg","stock":3}
    ],
    promos: [
      { id: "pr1", title: "Oferta de bienvenida", desc: "10% de descuento en todos los productos de la tienda.", percent: 10, all: true, productIds: [], until: "", image: "", active: true }
    ]
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function normalize(d) {
    d.config = Object.assign({}, defaults.config, d.config || {});
    delete d.config.pin;
    d.categories = Array.isArray(d.categories) ? d.categories : [];
    d.promos = Array.isArray(d.promos) ? d.promos : [];
    d.products = (d.products || []).map(p => {
      if (typeof p.stock !== "number") p.stock = p.available === false ? 0 : 10;
      delete p.available;
      return p;
    });
    return d;
  }

  // Si el navegador bloquea localStorage, se usa la memoria mientras la página esté abierta
  let memory = null;
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.products)) return normalize(d);
    } catch (e) {}
    if (memory) return normalize(clone(memory));
    return clone(defaults);
  }
  function save(data) {
    memory = clone(data);
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (e) { return e && e.name === "QuotaExceededError" ? false : true; }
  }
  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }

  function money(n, cfg) { return (cfg ? cfg.currency : "S/") + " " + Number(n).toFixed(2); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function uid() { return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function initials(name) {
    return String(name || "GM").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "GM";
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function formatDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return d + "/" + m + "/" + y;
  }

  // Promociones vigentes: activas y que no hayan vencido
  function activePromos(data) {
    const t = today();
    return data.promos.filter(x => x.active && (!x.until || x.until >= t));
  }
  // Precio final de un producto con la mejor promoción que le corresponda
  function priceOf(p, data) {
    let best = 0;
    activePromos(data).forEach(x => {
      if (x.all || (x.productIds || []).includes(p.id)) best = Math.max(best, Number(x.percent) || 0);
    });
    return { percent: best, original: p.price, final: Math.round(p.price * (100 - best)) / 100 };
  }

  // Foto de portada: la que subió el encargado o la original del local
  function heroImg(data, n) {
    return data.config["heroImage" + n] || (n === 1 ? "img/local-1.jpg" : "img/local-2.jpg");
  }

  return { load, save, loadCart, saveCart, money, esc, uid, initials, defaults, today, formatDate, activePromos, priceOf, heroImg };
})();
