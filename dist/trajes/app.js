// SYNQ Trajes: the 3D designer screen. Holds the design, builds the controls, lets people upload
// their own logos/photos and place them on the suit, and handles save, share, image and tailor sheet.
import { createStudio, patternCanvas, jacketCfg } from './studio.js';

// ---------- words ----------
const T = {
  es: {
    fHolo: 'Holográfico', tStonesTab: 'Pedrería', gemColor: 'Color de las piedras', edges: 'Orillas con pedrería', eLapels: 'Orilla de las solapas', eFront: 'Orilla del frente', eCuffs: 'Puños', ePockets: 'Bolsas', eStripes: 'Franjas del pantalón', eHem: 'Bajo del saco',
    scatter: 'Piedras sueltas', scatterHelp: 'Piedras regadas por la tela, como en los trajes de gala.', sBody: 'En el saco', sSleeves: 'En las mangas', sPants: 'En el pantalón', gemSize: 'Tamaño de piedra',
    gCrystal: 'Cristal', gAb: 'Tornasol (AB)', gGold: 'Oro', gSilver: 'Plata', gJet: 'Negro azabache', gRed: 'Rojo', gBlue: 'Azul', gPink: 'Rosa', gGreen: 'Verde',
    patterns: 'Diseños de estampado', patColor: 'Color del diseño', orLogo: 'O usa tu logo', patTribal: 'Tribal', patDamasco: 'Damasco', patLlamas: 'Llamas', patZebra: 'Cebra', patEstrellas: 'Estrellas', patSalpicado: 'Salpicado',
    pPanel: 'Paneles', pPiping: 'Vivos', panels: 'Paneles de contraste', panelsHelp: 'Piezas de otra tela, como en los trajes estilo moto o de carrera.', panShoulders: 'Hombros', panSides: 'Franja lateral del saco', panLegs: 'Franja lateral del pantalón', stripeWidth: 'Ancho de la franja', quick: 'Ponlo rápido en', spBack: 'Espalda', spChestL: 'Pecho izq.', spChestR: 'Pecho der.', spArmL: 'Brazo izq.', spArmR: 'Brazo der.', spLegL: 'Pierna izq.', spLegR: 'Pierna der.', orTap: 'o toca el traje donde quieras', toJacket: 'Usar en todo el saco', toPants: 'Usar en el pantalón', topBottom: 'Arriba y abajo',
    piping: 'Vivos (cordón en las costuras)', pipOn: 'Ponerle vivos', pipSides: 'Costuras de los lados', pipRacing: 'Líneas curvas (estilo carrera)', pipLapels: 'Orilla de las solapas', pipFront: 'Orilla del cierre', pipPants: 'Pantalón', pipSleeves: 'Mangas', pipCuffs: 'Puños', pipSize: 'Grosor',
    fMetallic: 'Piel metálica', fCrushed: 'Terciopelo arrugado', fFoil: 'Foil espejo', fSnake: 'Piel de víbora', fQuilted: 'Acolchado',
    bright: 'Brillo', recent: 'Recientes', quick: 'Colores rápidos', pickScreen: 'Tomar color de la pantalla',
    secMannequin: 'Maniquí', mqWhite: 'Blanco sin cara', mqBlack: 'Negro sin cara', mqCarved: 'Gris con cara', mqHeadless: 'Sin cabeza', mqGhost: 'Invisible', mqHuman: 'Persona',
    tPieces: 'Piezas', secJacket: 'Saco', secPants: 'Pantalón', secShirt: 'Camisa y cuello', secShoes: 'Calzado y tejana', secPanels: 'Paneles', secPiping: 'Vivos', secHardware: 'Metales',
    startFrom: 'Empezar desde', length: 'Largo', fit: 'Ajuste', fitSlim: 'Entallado', fitLoose: 'Holgado', collar: 'Cuello', cNotch: 'Solapa muesca', cPeak: 'Solapa pico', cShawl: 'Solapa chal', cStand: 'Cuello parado', cRib: 'Cuello de resorte', cShirt: 'Cuello camisero', cNone: 'Sin cuello',
    closure: 'Cierre', clButtons: 'Botones', clZipper: 'Cierre (zipper)', clSnaps: 'Broches', clOpen: 'Abierto', count: 'Cuántos', pockets: 'Bolsas', pkNone: 'Sin bolsas', pkFlap: 'Con cartera', pkWelt: 'De ribete', pkZip: 'Con zipper', pkPatch: 'De parche',
    chestPocket: 'Bolsa de pecho', pocketContrast: 'Bolsas en color de contraste', cuffsT: 'Puños', cfPlain: 'Sencillos', cfContrast: 'De contraste', cfRib: 'De resorte', cfButtons: 'Con botones', hemT: 'Bajo del saco', hmPlain: 'Sencillo', hmRib: 'Resorte',
    yokeT: 'Canesú', ykNone: 'Sin canesú', ykWestern: 'Vaquero (picos)', ykStraight: 'Recto', epaulettes: 'Charreteras (hombros)', turnups: 'Dobladillo vuelto', belt: 'Cinturón',
    shirtT: 'Camisa', shDress: 'De vestir', shTee: 'Playera', shTurtle: 'Cuello de tortuga', chain: 'Cadena de oro', shoesT: 'Zapatos', soBoots: 'Botas', soSneakers: 'Tenis', soDress: 'De vestir', refColors: 'Colores de tus referencias',
    title: 'Diseña tu traje', mine: 'Mis diseños', mineShort: 'Mis trajes', save: 'Guardar', share: 'Compartir', sheet: 'Hoja para el sastre', image: 'Imagen',
    front: 'Frente', back: 'Espalda', sideL: 'Lado', sideR: 'Otro lado', spin: 'Girar', dragHint: 'Arrastra para girar · pellizca para acercar', loading: 'Preparando el maniquí…',
    download: 'Descargar imagen', close: 'Cerrar', mineHelp: 'Se guardan en este teléfono o computadora.', madeBy: 'Hecho por SYNQ Studios · estudio de grabación en Rockford, IL', visit: 'Visita el estudio',
    tapToPlace: 'Toca el traje donde lo quieres', cancel: 'Cancelar',
    tStyles: 'Plantillas', catBanda: 'Banda', catNorteno: 'Norteño y sierreño', catModerno: 'Corridos y moderno', catGala: 'Gala y clásico', tCut: 'Corte', tFabric: 'Tela y color', tLogos: 'Logos y fotos', tPrint: 'Estampado', tText: 'Letras', tBand: 'Grupo',
    stylesHelp: 'Escoge una plantilla para tu grupo y cámbiala a tu gusto. Tus logos y fotos se quedan.',
    jacket: 'Saco', sBlazer: 'Saco', sBomber: 'Chamarra con cierre', sVarsity: 'Varsity (botones)', sWestern: 'Vaquero corto',
    lapel: 'Solapa', lNotch: 'Muesca', lPeak: 'Pico', lShawl: 'Chal', buttons: 'Botones', hardware: 'Cierre, botones y hebilla', gold: 'Oro', silver: 'Plata', black: 'Negro',
    yoke: 'Canesú (pieza de los hombros)', stripes: 'Franjas del pantalón', none: 'Ninguna', one: 'Una', two: 'Dos', sleeveStripes: 'Franjas en las mangas',
    neck: 'Cuello de la camisa', nBow: 'Moño', nTie: 'Corbata', nNone: 'Nada', hat: 'Tejana', hatShow: 'Ponerle tejana',
    part: 'Parte', fabric: 'Tela', color: 'Color', exact: 'Color exacto', applyAll: 'Usar en todo el traje',
    pBody: 'Saco', pSleeves: 'Mangas', pCollar: 'Solapas, cuello y bolsas', pCuffs: 'Puños y resorte', pPants: 'Pantalón', pStripes: 'Franjas', pShirt: 'Camisa', pTrim: 'Moño / corbata', pHat: 'Tejana', pShoes: 'Botas',
    fSatin: 'Satín brillante', fVelvet: 'Terciopelo', fSuede: 'Gamuza', fSequin: 'Lentejuela', fGlitter: 'Glitter', fLeather: 'Piel / charol', fWool: 'Casimir',
    upload: 'Sube tu logo o una foto', uploadHelp: 'PNG con fondo transparente se ve mejor. Toca para elegir o arrastra aquí.', yourImages: 'Tus imágenes', designs: 'Diseños listos',
    placeIt: 'Poner en el traje', removeBg: 'Quitar fondo', onSuit: 'En el traje', nothingPlaced: 'Todavía no pones nada. Escoge una imagen y toca “Poner en el traje”.',
    tech: 'Cómo va', tPrintT: 'Estampado', tEmb: 'Bordado', tStones: 'Pedrería', tPatch: 'Parche', size: 'Tamaño', rotate: 'Girar', mirror: 'Copiar al otro lado', del: 'Quitar',
    patchColor: 'Color del parche', threadColor: 'Color del hilo', dragToMove: 'Arrastra la imagen en el traje para moverla.',
    printHelp: 'Repite tu logo por todo el traje, como un estampado.', printImage: 'Imagen para el estampado', printParts: 'Dónde', spacing: 'Espacio', angle: 'Ángulo', removePrint: 'Quitar estampado', pickImage: 'Primero sube una imagen en “Logos y fotos”.',
    textHelp: 'El nombre del grupo, tu nombre o iniciales. Luego lo pones donde quieras.', textPh: 'Nombre del grupo', font: 'Letra', fill: 'Color de la letra', outline: 'Orilla', makeText: 'Crear y poner en el traje',
    fGothic: 'Gótica', fWestern: 'Vaquera', fPirate: 'Pirata', fScript: 'Cursiva', fBlock: 'Bloque',
    bandHelp: 'Pon las medidas de cada miembro. Salen en la hoja para el sastre.', mName: 'Nombre', mSize: 'Talla', mChest: 'Pecho', mWaist: 'Cintura', mSleeve: 'Manga', mInseam: 'Largo pant.', addMember: '+ Agregar miembro',
    notes: 'Notas para el sastre', notesPh: 'Ej.: forro rojo, pedrería Swarovski, entrega para el 15 de diciembre…', units: 'Medidas en pulgadas',
    saved: 'Diseño guardado', copied: 'Link copiado. Pégalo en un mensaje.', linkNoUploads: 'Link copiado. Tus fotos no van en el link: manda también la imagen.', shareText: 'Mira el traje que diseñé',
    noSaved: 'Todavía no guardas diseños.', open: 'Abrir', myDesign: 'Mi traje', downloading: 'Preparando imagen…', placedOk: 'Listo. Arrástralo para moverlo.', tooBig: 'No cupo en la memoria. Usa imágenes más chicas.',
    sheetTitle: 'Hoja para el sastre', specs: 'Especificaciones', members: 'Medidas del grupo', link: 'Ver el diseño en línea', placement: 'Lugar', technique: 'Técnica', approx: 'aprox.',
    made: 'Diseñado en synqstudios815.com/trajes', views: 'Vistas', yes: 'Sí', no: 'No',
    locFront: 'Frente del saco', locBack: 'Espalda del saco', locSide: 'Costado del saco', locSleeveL: 'Manga izquierda', locSleeveR: 'Manga derecha', locPantsL: 'Pierna izquierda', locPantsR: 'Pierna derecha',
    belowCollar: 'cm debajo del cuello', aboveHem: 'cm arriba del bajo', fromShoulder: 'cm debajo del hombro', centered: 'al centro', left: 'lado izquierdo', right: 'lado derecho',
  },
  en: {
    fHolo: 'Holographic', tStonesTab: 'Rhinestones', gemColor: 'Stone color', edges: 'Rhinestone edges', eLapels: 'Lapel edges', eFront: 'Front edges', eCuffs: 'Cuffs', ePockets: 'Pockets', eStripes: 'Pant stripes', eHem: 'Jacket hem',
    scatter: 'Sprinkled stones', scatterHelp: 'Single stones spread over the fabric, like on gala suits.', sBody: 'On the jacket', sSleeves: 'On the sleeves', sPants: 'On the pants', gemSize: 'Stone size',
    gCrystal: 'Crystal', gAb: 'Iridescent (AB)', gGold: 'Gold', gSilver: 'Silver', gJet: 'Jet black', gRed: 'Red', gBlue: 'Blue', gPink: 'Pink', gGreen: 'Green',
    patterns: 'Print patterns', patColor: 'Pattern color', orLogo: 'Or use your logo', patTribal: 'Tribal', patDamasco: 'Damask', patLlamas: 'Flames', patZebra: 'Zebra', patEstrellas: 'Stars', patSalpicado: 'Splatter',
    pPanel: 'Panels', pPiping: 'Piping', panels: 'Contrast panels', panelsHelp: 'Pieces in a second fabric, like moto or racing-style suits.', panShoulders: 'Shoulders', panSides: 'Jacket side stripe', panLegs: 'Pant side stripe', stripeWidth: 'Stripe width', quick: 'Quick place on', spBack: 'Back', spChestL: 'Left chest', spChestR: 'Right chest', spArmL: 'Left arm', spArmR: 'Right arm', spLegL: 'Left leg', spLegR: 'Right leg', orTap: 'or tap the suit anywhere', toJacket: 'Use on the whole jacket', toPants: 'Use on the pants', topBottom: 'Top and bottom',
    piping: 'Piping (cord along the seams)', pipOn: 'Add piping', pipSides: 'Side seams', pipRacing: 'Curved lines (racing style)', pipLapels: 'Lapel edges', pipFront: 'Zipper edges', pipPants: 'Pants', pipSleeves: 'Sleeves', pipCuffs: 'Cuffs', pipSize: 'Thickness',
    fMetallic: 'Metallic leather', fCrushed: 'Crushed velvet', fFoil: 'Mirror foil', fSnake: 'Snakeskin', fQuilted: 'Quilted',
    bright: 'Brightness', recent: 'Recent', quick: 'Quick colors', pickScreen: 'Pick a color from the screen',
    secMannequin: 'Mannequin', mqWhite: 'White faceless', mqBlack: 'Black faceless', mqCarved: 'Gray with face', mqHeadless: 'Headless', mqGhost: 'Invisible', mqHuman: 'Person',
    tPieces: 'Pieces', secJacket: 'Jacket', secPants: 'Pants', secShirt: 'Shirt & neck', secShoes: 'Shoes & hat', secPanels: 'Panels', secPiping: 'Piping', secHardware: 'Hardware',
    startFrom: 'Start from', length: 'Length', fit: 'Fit', fitSlim: 'Slim', fitLoose: 'Loose', collar: 'Collar', cNotch: 'Notch lapel', cPeak: 'Peak lapel', cShawl: 'Shawl lapel', cStand: 'Stand collar', cRib: 'Rib collar', cShirt: 'Shirt collar', cNone: 'No collar',
    closure: 'Closure', clButtons: 'Buttons', clZipper: 'Zipper', clSnaps: 'Snaps', clOpen: 'Open', count: 'How many', pockets: 'Pockets', pkNone: 'No pockets', pkFlap: 'Flap', pkWelt: 'Welt', pkZip: 'Zipper', pkPatch: 'Patch',
    chestPocket: 'Chest pocket', pocketContrast: 'Pockets in the contrast color', cuffsT: 'Cuffs', cfPlain: 'Plain', cfContrast: 'Contrast', cfRib: 'Rib', cfButtons: 'With buttons', hemT: 'Jacket hem', hmPlain: 'Plain', hmRib: 'Rib',
    yokeT: 'Yoke', ykNone: 'No yoke', ykWestern: 'Western (points)', ykStraight: 'Straight', epaulettes: 'Epaulettes (shoulders)', turnups: 'Turn-ups', belt: 'Belt',
    shirtT: 'Shirt', shDress: 'Dress shirt', shTee: 'T-shirt', shTurtle: 'Turtleneck', chain: 'Gold chain', shoesT: 'Shoes', soBoots: 'Boots', soSneakers: 'Sneakers', soDress: 'Dress shoes', refColors: 'Colors from your references',
    title: 'Design your suit', mine: 'My designs', mineShort: 'My suits', save: 'Save', share: 'Share', sheet: 'Tailor sheet', image: 'Image',
    front: 'Front', back: 'Back', sideL: 'Side', sideR: 'Other side', spin: 'Spin', dragHint: 'Drag to spin · pinch to zoom', loading: 'Getting the mannequin ready…',
    download: 'Download image', close: 'Close', mineHelp: 'Saved on this phone or computer.', madeBy: 'Made by SYNQ Studios · recording studio in Rockford, IL', visit: 'Visit the studio',
    tapToPlace: 'Tap the suit where you want it', cancel: 'Cancel',
    tStyles: 'Templates', catBanda: 'Banda', catNorteno: 'Norteño & sierreño', catModerno: 'Corridos & modern', catGala: 'Gala & classic', tCut: 'Cut', tFabric: 'Fabric & color', tLogos: 'Logos & photos', tPrint: 'All-over print', tText: 'Lettering', tBand: 'Band',
    stylesHelp: 'Pick a template for your group and make it yours. Your logos and photos stay.',
    jacket: 'Jacket', sBlazer: 'Blazer', sBomber: 'Zip-up bomber', sVarsity: 'Varsity (snaps)', sWestern: 'Short western',
    lapel: 'Lapel', lNotch: 'Notch', lPeak: 'Peak', lShawl: 'Shawl', buttons: 'Buttons', hardware: 'Zipper, buttons & buckle', gold: 'Gold', silver: 'Silver', black: 'Black',
    yoke: 'Western yoke (shoulder panel)', stripes: 'Pant stripes', none: 'None', one: 'One', two: 'Two', sleeveStripes: 'Sleeve stripes',
    neck: 'Shirt neck', nBow: 'Bow tie', nTie: 'Tie', nNone: 'None', hat: 'Hat', hatShow: 'Add a tejana',
    part: 'Part', fabric: 'Fabric', color: 'Color', exact: 'Exact color', applyAll: 'Use on the whole suit',
    pBody: 'Jacket', pSleeves: 'Sleeves', pCollar: 'Lapels, collar & pockets', pCuffs: 'Cuffs & ribbing', pPants: 'Pants', pStripes: 'Stripes', pShirt: 'Shirt', pTrim: 'Bow / tie', pHat: 'Hat', pShoes: 'Boots',
    fSatin: 'Glossy satin', fVelvet: 'Velvet', fSuede: 'Suede', fSequin: 'Sequins', fGlitter: 'Glitter', fLeather: 'Leather / patent', fWool: 'Wool',
    upload: 'Upload your logo or a photo', uploadHelp: 'A PNG with a transparent background looks best. Tap to choose or drop it here.', yourImages: 'Your images', designs: 'Ready-made designs',
    placeIt: 'Put it on the suit', removeBg: 'Remove background', onSuit: 'On the suit', nothingPlaced: 'Nothing placed yet. Pick an image and tap “Put it on the suit”.',
    tech: 'Made as', tPrintT: 'Print', tEmb: 'Embroidery', tStones: 'Rhinestones', tPatch: 'Patch', size: 'Size', rotate: 'Rotate', mirror: 'Copy to other side', del: 'Remove',
    patchColor: 'Patch color', threadColor: 'Thread color', dragToMove: 'Drag the image on the suit to move it.',
    printHelp: 'Repeat your logo all over the suit, like a print.', printImage: 'Image for the print', printParts: 'Where', spacing: 'Spacing', angle: 'Angle', removePrint: 'Remove print', pickImage: 'First upload an image in “Logos & photos”.',
    textHelp: 'Your band name, your name or initials. Then place it anywhere.', textPh: 'Band name', font: 'Lettering', fill: 'Letter color', outline: 'Outline', makeText: 'Create and put on the suit',
    fGothic: 'Gothic', fWestern: 'Western', fPirate: 'Pirate', fScript: 'Script', fBlock: 'Block',
    bandHelp: "Add each member's measurements. They print on the tailor sheet.", mName: 'Name', mSize: 'Size', mChest: 'Chest', mWaist: 'Waist', mSleeve: 'Sleeve', mInseam: 'Inseam', addMember: '+ Add member',
    notes: 'Notes for the tailor', notesPh: 'E.g. red lining, Swarovski stones, needed by December 15…', units: 'Measurements in inches',
    saved: 'Design saved', copied: 'Link copied. Paste it in a message.', linkNoUploads: "Link copied. Your photos don't travel in the link, so send the image too.", shareText: 'Check out the suit I designed',
    noSaved: 'No saved designs yet.', open: 'Open', myDesign: 'My suit', downloading: 'Getting the image ready…', placedOk: 'Done. Drag it to move it.', tooBig: "It didn't fit in memory. Use smaller images.",
    sheetTitle: 'Tailor sheet', specs: 'Specifications', members: 'Band measurements', link: 'See the design online', placement: 'Placement', technique: 'Technique', approx: 'approx.',
    made: 'Designed at synqstudios815.com/trajes', views: 'Views', yes: 'Yes', no: 'No',
    locFront: 'Jacket front', locBack: 'Jacket back', locSide: 'Jacket side', locSleeveL: 'Left sleeve', locSleeveR: 'Right sleeve', locPantsL: 'Left leg', locPantsR: 'Right leg',
    belowCollar: 'cm below the collar', aboveHem: 'cm above the hem', fromShoulder: 'cm below the shoulder', centered: 'centered', left: 'left side', right: 'right side',
  },
};
let lang = 'es';
try { lang = localStorage.getItem('synq-lang') || ((navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'es'); } catch (e) {}
const t = k => (T[lang] && T[lang][k]) || T.es[k] || k;

// ---------- choices ----------
const COLORS = [
  ['#111111', 'Negro', 'Black'], ['#f5f5f2', 'Blanco', 'White'], ['#e9dcc6', 'Hueso', 'Bone'], ['#c9b9a6', 'Gris arena', 'Greige'], ['#c9ab7c', 'Arena', 'Sand'], ['#8a6b45', 'Camel', 'Camel'],
  ['#4a2e1c', 'Café', 'Brown'], ['#5b0f1d', 'Vino', 'Wine'], ['#c4121f', 'Rojo', 'Red'], ['#e0285a', 'Fiusha', 'Fuchsia'], ['#f29bb8', 'Rosa', 'Pink'], ['#4b2aa8', 'Morado', 'Purple'],
  ['#14213d', 'Azul marino', 'Navy'], ['#1e4fb3', 'Azul rey', 'Royal blue'], ['#1a8fd6', 'Azul eléctrico', 'Electric blue'], ['#8ec5ff', 'Celeste', 'Sky blue'], ['#14a3a3', 'Turquesa', 'Turquoise'], ['#0f6b43', 'Verde esmeralda', 'Emerald'],
  ['#9fe3c4', 'Verde menta', 'Mint'], ['#4a5a2a', 'Verde olivo', 'Olive'], ['#7a7f86', 'Gris', 'Gray'], ['#c9ced6', 'Plata', 'Silver'], ['#d4a63c', 'Oro', 'Gold'], ['#e0661b', 'Naranja', 'Orange'], ['#f2c230', 'Amarillo', 'Yellow'],
];
const FABRICS = [['satin', 'fSatin'], ['velvet', 'fVelvet'], ['crushed', 'fCrushed'], ['suede', 'fSuede'], ['sequin', 'fSequin'], ['glitter', 'fGlitter'], ['holo', 'fHolo'], ['foil', 'fFoil'], ['snake', 'fSnake'], ['leather', 'fLeather'], ['metallic', 'fMetallic'], ['quilted', 'fQuilted'], ['wool', 'fWool']];
const GEMS = [['crystal', 'gCrystal', 'radial-gradient(circle at 35% 35%,#fff,#dfe9f5 45%,#8fa3bd)'], ['ab', 'gAb', 'radial-gradient(circle at 35% 35%,#fff,#cfe7ff 40%,#c79be8)'], ['gold', 'gGold', 'radial-gradient(circle at 35% 35%,#fff6c8,#e8c050 45%,#8c6512)'], ['silver', 'gSilver', 'radial-gradient(circle at 35% 35%,#fff,#c9ced6 45%,#6f7782)'], ['jet', 'gJet', 'radial-gradient(circle at 35% 35%,#9aa0a8,#2a2c31 45%,#050506)'], ['red', 'gRed', 'radial-gradient(circle at 35% 35%,#ffd2d2,#e0283a 45%,#6b0610)'], ['blue', 'gBlue', 'radial-gradient(circle at 35% 35%,#d6ecff,#2f7de0 45%,#0b2a63)'], ['pink', 'gPink', 'radial-gradient(circle at 35% 35%,#ffe1f0,#f06aa8 45%,#7a1446)'], ['green', 'gGreen', 'radial-gradient(circle at 35% 35%,#d9ffe6,#22b05e 45%,#063d1d)']];
// colors sampled from the reference suits you sent
const REF_COLORS = [['#c8202e', 'Xclusivo rojo'], ['#0d0d0f', 'Xclusivo negro'], ['#1aa0dc', 'Azul satín'], ['#5a2bc4', 'Morado satín'], ['#6a3fc9', 'Los de la Lou morado'], ['#7b3fe0', 'Profugos morado'],
  ['#18a85a', 'Bandera Verde'], ['#d9a62e', 'Los Aliados oro'], ['#b3121f', 'Edición NM rojo'], ['#9da2a8', 'Mala Conducta plata'], ['#d9dde2', 'Viada gris'], ['#c9bfb4', 'Gamuza gris'], ['#efe9f2', 'Malicia tornasol'], ['#e3241b', 'Marca Alianza rojo']];
const PATTERNS = [['tribal', 'patTribal'], ['damasco', 'patDamasco'], ['llamas', 'patLlamas'], ['zebra', 'patZebra'], ['estrellas', 'patEstrellas'], ['salpicado', 'patSalpicado']];
const PARTS = [['body', 'pBody'], ['sleeves', 'pSleeves'], ['panel', 'pPanel'], ['piping', 'pPiping'], ['collar', 'pCollar'], ['cuffs', 'pCuffs'], ['pants', 'pPants'], ['stripes', 'pStripes'], ['shirt', 'pShirt'], ['trim', 'pTrim'], ['hat', 'pHat'], ['shoes', 'pShoes']];
const TECHS = [['print', 'tPrintT'], ['embroidery', 'tEmb'], ['stones', 'tStones'], ['patch', 'tPatch']];
const FONTS = [['gothic', 'fGothic', '"UnifrakturMaguntia", serif'], ['western', 'fWestern', 'Rye, serif'], ['pirate', 'fPirate', '"Pirata One", serif'], ['script', 'fScript', '"Great Vibes", cursive'], ['block', 'fBlock', 'Anton, Impact, sans-serif']];

const clone = o => JSON.parse(JSON.stringify(o));
const P = (fabric, color) => ({ fabric, color });
const BASE = {
  v: 2, name: '', style: 'blazer', lapel: 'notch', buttons: 1, neckwear: 'bow', hat: true, stripes: 'one', sleeveStripes: false, yoke: true, hardware: 'gold',
  panels: { shoulders: false, sides: false, legs: false },
  piping: { on: false, sides: true, racing: false, lapels: true, front: true, pants: true, sleeves: false, cuffs: true, size: 0.0022 },
  parts: { panel: P('sequin', '#c4121f'), piping: P('satin', '#d4a63c'), body: P('velvet', '#5b0f1d'), sleeves: P('velvet', '#5b0f1d'), collar: P('satin', '#111111'), cuffs: P('satin', '#111111'), pants: P('velvet', '#5b0f1d'), stripes: P('satin', '#111111'),
    shirt: P('satin', '#f5f5f2'), trim: P('satin', '#111111'), hat: P('suede', '#e9dcc6'), shoes: P('leather', '#111111') },
  print: null, decals: [], images: {}, members: [], notes: '',
  stones: { color: 'crystal', size: 0.0032, edges: { lapels: true, front: false, cuffs: false, pockets: false, stripes: false, hem: false }, scatter: { body: 0, sleeves: 0, pants: 0 } },
};
function look(name, over, parts) { const d = clone(BASE); Object.assign(d, over); Object.keys(parts || {}).forEach(k => { d.parts[k] = parts[k]; }); d.name = name; return d; }
const all = (f, c) => ({ body: P(f, c), sleeves: P(f, c), pants: P(f, c) });
const tid = spec => 't:' + btoa(unescape(encodeURIComponent(JSON.stringify(spec)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const CATS = { 'Terciopelo vino': 'banda', 'Vino con filigrana': 'banda', 'Lentejuela negra': 'gala', 'Morado brillante': 'gala', 'Azul eléctrico': 'gala', 'Dos tonos azul y blanco': 'gala',
  'Vaquero arena': 'norteno', 'Gamuza y piel': 'moderno', 'Satín negro y rojo': 'moderno', 'Terciopelo rojo': 'moderno', 'Holográfico tribal': 'moderno', 'Carrera rojo y negro': 'moderno',
  'Terciopelo morado': 'moderno', 'Plata moto': 'moderno', 'Holográfico y morado': 'moderno', 'Víbora tornasol': 'moderno', 'Verde con franja negra': 'moderno', 'Terciopelo negro y rojo': 'moderno' };
const PRESETS = [
  look('Terciopelo vino', {}, {}),
  look('Satín negro y rojo', { style: 'bomber', hat: true, stripes: 'one', sleeveStripes: true, hardware: 'silver' }, Object.assign(all('satin', '#111111'), { collar: P('wool', '#111111'), cuffs: P('wool', '#111111'), stripes: P('satin', '#c4121f'), hat: P('suede', '#f5f5f2') })),
  look('Azul eléctrico', { style: 'blazer', lapel: 'peak', stripes: 'one', hardware: 'silver', neckwear: 'none' }, Object.assign(all('satin', '#1a8fd6'), { collar: P('satin', '#f5f5f2'), cuffs: P('satin', '#1a8fd6'), stripes: P('satin', '#f5f5f2'), shirt: P('satin', '#111111'), hat: P('suede', '#e9dcc6') })),
  look('Terciopelo rojo', { style: 'bomber', stripes: 'none', sleeveStripes: false, hat: false, hardware: 'silver' }, Object.assign(all('velvet', '#b0101e'), { collar: P('velvet', '#b0101e'), cuffs: P('velvet', '#b0101e') })),
  look('Gamuza y piel', { style: 'varsity', stripes: 'one', hat: true, hardware: 'silver' }, Object.assign(all('suede', '#c9b9a6'), { sleeves: P('leather', '#111111'), collar: P('wool', '#111111'), cuffs: P('wool', '#111111'), stripes: P('leather', '#111111'), hat: P('suede', '#f5f5f2') })),
  look('Lentejuela negra', { style: 'blazer', lapel: 'shawl', stripes: 'one', neckwear: 'bow', hat: false, hardware: 'silver' }, Object.assign(all('sequin', '#111111'), { pants: P('wool', '#111111'), collar: P('satin', '#111111'), cuffs: P('sequin', '#111111'), stripes: P('satin', '#111111') })),
  look('Morado brillante', { style: 'blazer', lapel: 'notch', stripes: 'none', neckwear: 'none', hat: true, hardware: 'silver' }, Object.assign(all('satin', '#4b2aa8'), { collar: P('satin', '#e9dcc6'), cuffs: P('satin', '#4b2aa8'), shirt: P('satin', '#111111'), hat: P('suede', '#e9dcc6') })),
  look('Vino con filigrana', { style: 'blazer', lapel: 'notch', stripes: 'none', neckwear: 'none', hat: false, hardware: 'silver',
    stones: { color: 'crystal', size: 0.003, edges: { lapels: true, front: true, cuffs: true, pockets: true, stripes: false, hem: false }, scatter: { body: 28, sleeves: 18, pants: 0 } },
    decals: [{ id: 'f1', imageId: 'm:filigrana:silver', tech: 'embroidery', point: [0.11, 1.12, 0.11], normal: [0.45, 0, 0.9], part: 'body', size: 0.34, rot: 0 },
      { id: 'f2', imageId: 'm:filigrana:silver', tech: 'embroidery', point: [-0.11, 1.12, 0.11], normal: [-0.45, 0, 0.9], part: 'body', size: 0.34, rot: 0 },
      { id: 'f3', imageId: 'm:arabesco:silver', tech: 'embroidery', point: [0.12, 0.86, 0.12], normal: [0.4, 0, 0.9], part: 'body', size: 0.1, rot: 0 },
      { id: 'f4', imageId: 'm:arabesco:silver', tech: 'embroidery', point: [-0.12, 0.86, 0.12], normal: [-0.4, 0, 0.9], part: 'body', size: 0.1, rot: 0 }] },
    Object.assign(all('suede', '#6e1020'), { collar: P('suede', '#6e1020'), cuffs: P('suede', '#6e1020'), shirt: P('satin', '#f5f5f2') })),
  look('Holográfico tribal', { style: 'blazer', lapel: 'notch', stripes: 'none', neckwear: 'none', hat: false, hardware: 'gold',
    print: { pattern: 'tribal', color: '#d4a63c', parts: ['body'], size: 0.3, rotate: 0 },
    decals: [{ id: 'h1', imageId: 't:' + btoa(unescape(encodeURIComponent(JSON.stringify({ text: 'Tu Grupo', font: 'pirate', fill: '#e0661b', outline: '#111111' })))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), tech: 'embroidery', point: [0, 1.3, -0.2], normal: [0, 0, -1], part: 'body', size: 0.28, rot: 0 }] },
    Object.assign(all('holo', '#111111'), { sleeves: P('satin', '#f5f5f2'), pants: P('satin', '#f5f5f2'), collar: P('satin', '#111111'), cuffs: P('satin', '#f5f5f2'), shirt: P('satin', '#111111') })),
  look('Carrera rojo y negro', { style: 'bomber', stripes: 'none', hat: false, hardware: 'gold', panels: { shoulders: true, sides: true, legs: false },
    piping: Object.assign(clone(BASE.piping), { on: true, racing: true, sides: false, size: 0.0026 }) },
    Object.assign(all('satin', '#111111'), { panel: P('sequin', '#c4121f'), piping: P('satin', '#d4a63c'), collar: P('wool', '#111111'), cuffs: P('wool', '#111111') })),
  look('Terciopelo morado', { style: 'bomber', stripes: 'none', hat: false, hardware: 'silver', piping: Object.assign(clone(BASE.piping), { on: true, sides: true, pants: true, sleeves: true }),
    stones: { color: 'crystal', size: 0.003, edges: { lapels: false, front: false, cuffs: false, pockets: false, stripes: false, hem: false }, scatter: { body: 22, sleeves: 14, pants: 10 } } },
    Object.assign(all('crushed', '#5a2bb0'), { collar: P('crushed', '#5a2bb0'), cuffs: P('crushed', '#5a2bb0'), piping: P('satin', '#e6e9ee') })),
  look('Plata moto', { style: 'bomber', stripes: 'none', hat: false, hardware: 'silver', panels: { shoulders: true, sides: false, legs: true },
    piping: Object.assign(clone(BASE.piping), { on: true, sides: true, pants: true, cuffs: true }) },
    Object.assign(all('metallic', '#b4b9c0'), { sleeves: P('quilted', '#141414'), panel: P('quilted', '#141414'), piping: P('satin', '#f5f5f2'), collar: P('metallic', '#b4b9c0'), cuffs: P('quilted', '#141414') })),
  look('Holográfico y morado', { style: 'bomber', stripes: 'none', hat: true, hardware: 'silver' },
    Object.assign(all('holo', '#141826'), { sleeves: P('sequin', '#6a2fd6'), collar: P('satin', '#111111'), cuffs: P('satin', '#111111'), hat: P('suede', '#111111') })),
  look('Víbora tornasol', { style: 'blazer', lapel: 'notch', stripes: 'none', neckwear: 'none', hat: false, hardware: 'silver' },
    Object.assign(all('snake', '#efe9f2'), { collar: P('snake', '#efe9f2'), cuffs: P('snake', '#efe9f2'), shirt: P('satin', '#111111') })),
  look('Verde con franja negra', { style: 'bomber', stripes: 'none', hat: true, hardware: 'silver', panels: { shoulders: false, sides: true, legs: true, sideWidth: 0.5, legWidth: 0.45 },
    decals: [{ id: 'v1', imageId: tid({ text: 'TU GRUPO', font: 'block', fill: '#18a85a', outline: '#111111' }), tech: 'patch', point: [0, 1.27, -0.25], normal: [0, 0, -1], part: 'body', size: 0.36, rot: 0, patchColor: '#f5f5f2', threadColor: '#111111' }] },
    Object.assign(all('foil', '#18a85a'), { panel: P('wool', '#111111'), collar: P('wool', '#111111'), cuffs: P('wool', '#111111'), hat: P('suede', '#f5f5f2') })),
  look('Terciopelo negro y rojo', { style: 'bomber', stripes: 'none', hat: false, hardware: 'gold',
    piping: Object.assign(clone(BASE.piping), { on: true, sides: true, sleeves: true, pants: true }),
    stones: { color: 'crystal', size: 0.003, edges: { lapels: false, front: false, cuffs: false, pockets: false, stripes: false, hem: false }, scatter: { body: 12, sleeves: 8, pants: 6 } },
    decals: [{ id: 'n1', imageId: tid({ text: 'Tu Grupo', font: 'gothic', fill: '#c4121f', outline: 'none' }), tech: 'embroidery', point: [0.09, 1.3, 0.2], normal: [0.3, 0, 1], part: 'body', size: 0.16, rot: 0 },
      { id: 'n2', imageId: tid({ text: 'Tu Grupo', font: 'gothic', fill: '#c4121f', outline: 'none' }), tech: 'embroidery', point: [-0.32, 1.23, 0], normal: [-1, 0, 0], part: 'sleeves', size: 0.14, rot: 90 },
      { id: 'n3', imageId: tid({ text: 'Tu Grupo', font: 'gothic', fill: '#c4121f', outline: 'none' }), tech: 'embroidery', point: [0.13, 0.7, 0.15], normal: [0.35, 0, 1], part: 'pants', size: 0.16, rot: 0 }] },
    Object.assign(all('crushed', '#1a1a1c'), { collar: P('crushed', '#1a1a1c'), cuffs: P('crushed', '#1a1a1c'), piping: P('satin', '#c4121f') })),
  look('Dos tonos azul y blanco', { style: 'blazer', lapel: 'notch', stripes: 'one', neckwear: 'none', hat: true, hardware: 'silver' },
    Object.assign(all('satin', '#1a8fd6'), { pants: P('satin', '#f5f5f2'), stripes: P('satin', '#1a8fd6'), collar: P('satin', '#f5f5f2'), cuffs: P('satin', '#1a8fd6'), shirt: P('satin', '#111111'), hat: P('suede', '#f5f5f2') })),
  // ---- more templates, based on what groups wear on stage ----
  look('Banda negro y oro', { cat: 'banda', style: 'blazer', lapel: 'peak', buttons: 2, stripes: 'one', neckwear: 'bow', hat: true, hardware: 'gold',
    piping: Object.assign(clone(BASE.piping), { on: true, sides: false, lapels: true, pants: false, cuffs: true }),
    decals: [{ id: 'b1', imageId: 'm:arabesco:gold', tech: 'embroidery', point: [0.1, 1.24, 0.2], normal: [0.35, 0, 1], part: 'body', size: 0.14, rot: 0 },
      { id: 'b2', imageId: 'm:arabesco:gold', tech: 'embroidery', point: [-0.1, 1.24, 0.2], normal: [-0.35, 0, 1], part: 'body', size: 0.14, rot: 0 },
      { id: 'b3', imageId: 'm:filigrana:gold', tech: 'embroidery', point: [0, 1.25, -0.25], normal: [0, 0, -1], part: 'body', size: 0.3, rot: 0 }] },
    Object.assign(all('wool', '#111111'), { collar: P('satin', '#111111'), cuffs: P('satin', '#111111'), stripes: P('metallic', '#d4a63c'), piping: P('satin', '#d4a63c'), trim: P('satin', '#d4a63c'), hat: P('suede', '#111111') })),
  look('Banda blanco y plata', { cat: 'banda', style: 'blazer', lapel: 'shawl', buttons: 1, stripes: 'one', neckwear: 'bow', hat: true, hardware: 'silver',
    stones: { color: 'crystal', size: 0.003, edges: { lapels: true, front: false, cuffs: true, pockets: false, stripes: true, hem: false }, scatter: { body: 0, sleeves: 0, pants: 0 } },
    decals: [{ id: 'w1', imageId: 'm:filigrana:silver', tech: 'embroidery', point: [0.11, 1.12, 0.2], normal: [0.45, 0, 0.9], part: 'body', size: 0.3, rot: 0 },
      { id: 'w2', imageId: 'm:filigrana:silver', tech: 'embroidery', point: [-0.11, 1.12, 0.2], normal: [-0.45, 0, 0.9], part: 'body', size: 0.3, rot: 0 }] },
    Object.assign(all('satin', '#f5f5f2'), { collar: P('satin', '#c9ced6'), cuffs: P('satin', '#c9ced6'), stripes: P('metallic', '#c9ced6'), shirt: P('satin', '#111111'), trim: P('satin', '#c9ced6'), hat: P('suede', '#f5f5f2') })),
  look('Banda azul marino y oro', { cat: 'banda', style: 'blazer', lapel: 'notch', buttons: 2, stripes: 'two', neckwear: 'tie', hat: true, hardware: 'gold',
    piping: Object.assign(clone(BASE.piping), { on: true, sides: false, lapels: true, pants: false, cuffs: false }) },
    Object.assign(all('wool', '#14213d'), { collar: P('satin', '#14213d'), cuffs: P('wool', '#14213d'), stripes: P('satin', '#d4a63c'), piping: P('satin', '#d4a63c'), trim: P('satin', '#d4a63c'), hat: P('suede', '#e9dcc6') })),
  look('Banda rojo bordado', { cat: 'banda', style: 'blazer', lapel: 'peak', buttons: 1, stripes: 'one', neckwear: 'bow', hat: false, hardware: 'gold',
    decals: [{ id: 'r1', imageId: 'm:rosa:gold', tech: 'embroidery', point: [0.12, 1.32, 0.18], normal: [0.4, 0, 0.9], part: 'body', size: 0.12, rot: 0 },
      { id: 'r2', imageId: 'm:rosa:gold', tech: 'embroidery', point: [-0.12, 1.32, 0.18], normal: [-0.4, 0, 0.9], part: 'body', size: 0.12, rot: 0 },
      { id: 'r3', imageId: 'm:arabesco:gold', tech: 'embroidery', point: [0.12, 0.3, 0.1], normal: [0.3, 0, 1], part: 'pants', size: 0.12, rot: 90 },
      { id: 'r4', imageId: 'm:arabesco:gold', tech: 'embroidery', point: [-0.12, 0.3, 0.1], normal: [-0.3, 0, 1], part: 'pants', size: 0.12, rot: 90 }] },
    Object.assign(all('velvet', '#b0101e'), { collar: P('satin', '#111111'), cuffs: P('satin', '#111111'), stripes: P('metallic', '#d4a63c'), trim: P('satin', '#111111') })),
  look('Norteño gamuza camel', { cat: 'norteno', style: 'western', yoke: true, stripes: 'none', hat: true, hardware: 'silver', shoes: 'boots',
    decals: [{ id: 'g1', imageId: 'm:arabesco:silver', tech: 'embroidery', point: [0.1, 1.36, 0.18], normal: [0.35, 0, 1], part: 'body', size: 0.12, rot: 0 },
      { id: 'g2', imageId: 'm:arabesco:silver', tech: 'embroidery', point: [-0.1, 1.36, 0.18], normal: [-0.35, 0, 1], part: 'body', size: 0.12, rot: 0 }] },
    Object.assign(all('suede', '#a57a4e'), { collar: P('suede', '#4a2e1c'), cuffs: P('suede', '#4a2e1c'), hat: P('suede', '#e9dcc6'), shoes: P('leather', '#4a2e1c') })),
  look('Sierreño negro y plata', { cat: 'norteno', style: 'western', yoke: true, stripes: 'none', hat: true, hardware: 'silver',
    piping: Object.assign(clone(BASE.piping), { on: true, sides: false, front: true, sleeves: false, cuffs: true, pants: false }),
    decals: [{ id: 's1', imageId: 'm:herradura:silver', tech: 'embroidery', point: [0, 1.25, -0.25], normal: [0, 0, -1], part: 'body', size: 0.2, rot: 0 },
      { id: 's2', imageId: 'm:estrella:silver', tech: 'stones', point: [0.1, 1.36, 0.18], normal: [0.35, 0, 1], part: 'body', size: 0.06, rot: 0 },
      { id: 's3', imageId: 'm:estrella:silver', tech: 'stones', point: [-0.1, 1.36, 0.18], normal: [-0.35, 0, 1], part: 'body', size: 0.06, rot: 0 }] },
    Object.assign(all('suede', '#151515'), { collar: P('leather', '#151515'), cuffs: P('leather', '#151515'), piping: P('satin', '#d9dde3'), hat: P('suede', '#f5f5f2') })),
  look('Norteño tornasol azul', { cat: 'norteno', style: 'blazer', lapel: 'notch', buttons: 1, stripes: 'none', neckwear: 'none', hat: true, hardware: 'silver' },
    Object.assign(all('holo', '#1e4fb3'), { pants: P('satin', '#111111'), collar: P('satin', '#111111'), cuffs: P('satin', '#111111'), shirt: P('satin', '#111111'), hat: P('suede', '#f5f5f2') })),
  look('Bomber lentejuela roja', { cat: 'moderno', style: 'bomber', stripes: 'one', hat: false, hardware: 'silver' },
    Object.assign(all('sequin', '#c4121f'), { sleeves: P('satin', '#111111'), pants: P('satin', '#111111'), stripes: P('sequin', '#c4121f'), collar: P('wool', '#111111'), cuffs: P('wool', '#111111') })),
  look('Terciopelo negro y plata', { cat: 'moderno', style: 'bomber', stripes: 'none', hat: false, hardware: 'silver', shoes: 'sneakers',
    piping: Object.assign(clone(BASE.piping), { on: true, sides: true, sleeves: true, pants: true, cuffs: false }),
    stones: { color: 'crystal', size: 0.003, edges: { lapels: false, front: false, cuffs: false, pockets: false, stripes: false, hem: false }, scatter: { body: 14, sleeves: 8, pants: 8 } },
    decals: [{ id: 'k1', imageId: tid({ text: 'Tu Grupo', font: 'script', fill: '#e6e9ee', outline: 'none' }), tech: 'embroidery', point: [0.09, 1.3, 0.2], normal: [0.3, 0, 1], part: 'body', size: 0.16, rot: 0 },
      { id: 'k2', imageId: tid({ text: 'Tu Grupo', font: 'script', fill: '#e6e9ee', outline: 'none' }), tech: 'embroidery', point: [-0.13, 0.7, 0.15], normal: [-0.35, 0, 1], part: 'pants', size: 0.16, rot: 0 }] },
    Object.assign(all('crushed', '#141414'), { collar: P('crushed', '#141414'), cuffs: P('crushed', '#141414'), piping: P('satin', '#d9dde3'), shoes: P('leather', '#111111') })),
  look('Logo por todo el traje', { cat: 'moderno', style: 'blazer', lapel: 'notch', buttons: 1, stripes: 'none', neckwear: 'none', hat: true, hardware: 'silver',
    print: { imageId: tid({ text: 'X', font: 'gothic', fill: '#c8202e', outline: '#111111' }), parts: ['body', 'sleeves', 'pants'], size: 0.09, gap: 0.08, rotate: -8 },
    decals: [{ id: 'x1', imageId: tid({ text: 'Tu Grupo', font: 'gothic', fill: '#c8202e', outline: '#111111' }), tech: 'embroidery', point: [0, 1.27, -0.25], normal: [0, 0, -1], part: 'body', size: 0.34, rot: 0 }] },
    Object.assign(all('satin', '#f5f5f2'), { collar: P('satin', '#f5f5f2'), cuffs: P('satin', '#f5f5f2'), shirt: P('satin', '#111111'), hat: P('suede', '#f5f5f2') })),
  look('Gris con salpicado', { cat: 'moderno', style: 'bomber', stripes: 'none', hat: false, hardware: 'silver',
    print: { pattern: 'salpicado', color: '#111111', parts: ['body', 'sleeves', 'pants'], size: 0.4, rotate: 0 },
    piping: Object.assign(clone(BASE.piping), { on: true, sides: true, sleeves: true, pants: true }),
    decals: [{ id: 'y1', imageId: tid({ text: 'GRUPO', font: 'block', fill: '#3a3a3a', outline: '#111111' }), tech: 'embroidery', point: [0, 1.33, -0.25], normal: [0, 0, -1], part: 'body', size: 0.24, rot: 0 }] },
    Object.assign(all('satin', '#d9dde2'), { collar: P('satin', '#d9dde2'), cuffs: P('satin', '#d9dde2'), piping: P('satin', '#111111') })),
  look('Negro y oro en relieve', { cat: 'moderno', style: 'blazer', lapel: 'notch', buttons: 1, stripes: 'none', neckwear: 'none', hat: true, hardware: 'gold',
    stones: { color: 'gold', size: 0.003, edges: { lapels: false, front: false, cuffs: false, pockets: false, stripes: false, hem: false }, scatter: { body: 10, sleeves: 0, pants: 0 } },
    decals: [{ id: 'a1', imageId: tid({ text: 'TU GRUPO', font: 'western', fill: '#d9a62e', outline: '#8a6414' }), tech: 'embroidery', point: [0, 1.27, -0.25], normal: [0, 0, -1], part: 'body', size: 0.34, rot: 0 }] },
    Object.assign(all('glitter', '#111111'), { pants: P('satin', '#111111'), collar: P('satin', '#111111'), cuffs: P('glitter', '#111111'), shirt: P('satin', '#111111'), hat: P('suede', '#f5f5f2') })),
  look('Blanco con pedrería negra', { cat: 'moderno', style: 'blazer', lapel: 'notch', buttons: 1, stripes: 'none', neckwear: 'none', hat: false, hardware: 'silver',
    stones: { color: 'jet', size: 0.0034, edges: { lapels: false, front: false, cuffs: false, pockets: false, stripes: false, hem: false }, scatter: { body: 26, sleeves: 16, pants: 6 } },
    decals: [{ id: 'm1', imageId: tid({ text: 'TU GRUPO', font: 'block', fill: '#c4121f', outline: '#111111' }), tech: 'stones', point: [0, 1.3, -0.25], normal: [0, 0, -1], part: 'body', size: 0.3, rot: 0 }] },
    Object.assign(all('wool', '#f5f5f2'), { collar: P('wool', '#f5f5f2'), cuffs: P('wool', '#f5f5f2'), shirt: P('satin', '#111111') })),
  look('Esmoquin negro', { cat: 'gala', style: 'blazer', lapel: 'shawl', buttons: 1, stripes: 'one', neckwear: 'bow', hat: false, hardware: 'black', shoes: 'dress' },
    Object.assign(all('wool', '#111111'), { collar: P('satin', '#111111'), cuffs: P('wool', '#111111'), stripes: P('satin', '#111111'), shirt: P('satin', '#f5f5f2'), trim: P('satin', '#111111') })),
  look('Esmoquin blanco', { cat: 'gala', style: 'blazer', lapel: 'peak', buttons: 1, stripes: 'one', neckwear: 'bow', hat: false, hardware: 'black', shoes: 'dress' },
    Object.assign(all('wool', '#f5f2ea'), { pants: P('wool', '#111111'), collar: P('satin', '#111111'), cuffs: P('wool', '#f5f2ea'), stripes: P('satin', '#111111'), shirt: P('satin', '#f5f5f2'), trim: P('satin', '#111111') })),
  look('Vaquero arena', { style: 'western', yoke: true, stripes: 'none', hat: true, hardware: 'gold' }, Object.assign(all('suede', '#c9ab7c'), { collar: P('suede', '#4a2e1c'), cuffs: P('suede', '#4a2e1c'), hat: P('suede', '#e9dcc6'), shoes: P('suede', '#4a2e1c') })),
];

// ---------- ready-made embroidery designs (drawn as images) ----------
const MOTIFS = {
  arabesco: 'M-46 18 C-36 -26 -6 -30 0 0 C 6 30 36 26 46 -18 M-46 18 C-52 34 -32 40 -28 28 C-25 20 -34 16 -37 22 M46 -18 C52 -34 32 -40 28 -28 C25 -20 34 -16 37 -22 M-18 -14 C-10 -30 8 -34 14 -22 M18 14 C10 30 -8 34 -14 22',
  rosa: 'M0 -8 C6 -8 8 -2 4 2 C0 6 -6 4 -6 -1 C-6 -6 -1 -9 3 -7 M0 -16 C12 -18 18 -6 14 4 C10 14 -4 16 -12 10 C-20 4 -16 -12 -6 -16 Z M-12 10 C-20 22 -30 26 -40 24 M-22 20 C-30 14 -38 16 -40 22 C-34 26 -26 26 -22 20 Z M10 12 C18 24 30 28 40 26 M24 22 C30 14 38 16 40 22 C34 28 28 28 24 22 Z',
  llamas: 'M-30 40 C-44 18 -38 -6 -28 -22 C-26 -6 -18 2 -14 6 C-16 -14 -10 -32 2 -46 C2 -26 12 -14 16 0 C20 -10 26 -16 32 -22 C40 -2 38 22 26 40 Z',
  herradura: 'M-28 40 L-34 0 C-38 -30 -20 -46 0 -46 C20 -46 38 -30 34 0 L28 40 L16 40 L20 2 C22 -20 12 -32 0 -32 C-12 -32 -22 -20 -20 2 L-16 40 Z',
  estrella: 'M0 -46 L11 -14 L45 -14 L18 6 L28 40 L0 20 L-28 40 L-18 6 L-45 -14 L-11 -14 Z',
  cruz: 'M-7 -46 L7 -46 L7 -22 L28 -22 L28 -8 L7 -8 L7 46 L-7 46 L-7 -8 L-28 -8 L-28 -22 L-7 -22 Z',
  aguila: 'M0 -30 C6 -30 10 -26 10 -20 L22 -26 C30 -30 40 -28 48 -20 C40 -18 34 -14 30 -8 C40 -10 46 -6 48 0 C38 0 30 2 24 8 C30 10 34 14 34 20 C24 18 16 16 10 20 L8 36 L0 30 L-8 36 L-10 20 C-16 16 -24 18 -34 20 C-34 14 -30 10 -24 8 C-30 2 -38 0 -48 0 C-46 -6 -40 -10 -30 -8 C-34 -14 -40 -18 -48 -20 C-40 -28 -30 -30 -22 -26 L-10 -20 C-10 -26 -6 -30 0 -30 Z',
  rayo: 'M8 -46 L-22 6 L-2 6 L-10 46 L24 -10 L4 -10 L14 -46 Z',
  corona: 'M-40 24 L-44 -16 L-22 4 L0 -30 L22 4 L44 -16 L40 24 Z M-40 30 L40 30 L40 38 L-40 38 Z',
  filigrana: 'M0 -50 L0 50 M0 -50 C6 -44 6 -38 0 -34 M0 -30 C14 -40 26 -30 20 -20 C16 -13 8 -16 10 -22 M0 -8 C16 -16 30 -4 22 8 C16 14 8 10 10 4 M0 18 C12 12 22 20 18 30 C14 36 8 32 9 27 M0 40 C8 34 16 38 14 46 M20 -20 C28 -16 30 -8 26 -4 M22 8 C30 12 30 22 24 24',
  calavera: 'M0 -40 C-26 -40 -36 -20 -34 -2 C-33 10 -26 16 -22 18 L-22 32 L22 32 L22 18 C26 16 33 10 34 -2 C36 -20 26 -40 0 -40 Z M-20 -8 C-20 -16 -6 -16 -6 -6 C-6 2 -20 2 -20 -8 Z M20 -8 C20 -16 6 -16 6 -6 C6 2 20 2 20 -8 Z M0 4 L-5 14 L5 14 Z',
};
const MOTIF_NAMES = { arabesco: ['Arabesco', 'Scrollwork'], rosa: ['Rosa', 'Rose'], llamas: ['Llamas', 'Flames'], herradura: ['Herradura', 'Horseshoe'], estrella: ['Estrella', 'Star'], cruz: ['Cruz', 'Cross'], aguila: ['Águila', 'Eagle'], rayo: ['Rayo', 'Lightning'], filigrana: ['Filigrana', 'Filigree'], corona: ['Corona', 'Crown'], calavera: ['Calavera', 'Skull'] };
const FILLED = { llamas: 1, herradura: 1, estrella: 1, cruz: 1, aguila: 1, rayo: 1, corona: 1, calavera: 1 };
function motifImage(name, color) {
  const c = document.createElement('canvas'); c.width = c.height = 400; const x = c.getContext('2d');
  x.translate(200, 200); x.scale(3.6, 3.6);
  const p = new Path2D(MOTIFS[name]);
  const g = x.createLinearGradient(-50, -50, 50, 50);
  const cols = color === 'silver' ? ['#ffffff', '#c9ced6', '#7c838d'] : color === 'red' ? ['#ff8a8a', '#d0141f', '#6b0610'] : ['#fff2b0', '#e2b84a', '#8a6414'];
  g.addColorStop(0, cols[0]); g.addColorStop(0.5, cols[1]); g.addColorStop(1, cols[2]);
  x.lineJoin = x.lineCap = 'round';
  const draw = () => { if (FILLED[name]) { x.fillStyle = g; x.fill(p, 'evenodd'); x.strokeStyle = cols[2]; x.lineWidth = 1.2; x.stroke(p); } else { x.strokeStyle = g; x.lineWidth = name === 'filigrana' ? 3.2 : 5; x.stroke(p); } };
  draw(); if (name === 'filigrana') { x.scale(-1, 1); draw(); }
  return trim(c).toDataURL('image/png');
}

// ---------- lettering as an image ----------
async function textImage(spec) {
  const f = FONTS.find(x => x[0] === spec.font) || FONTS[0];
  try { await document.fonts.load('120px ' + f[2].split(',')[0]); } catch (e) {}
  const c = document.createElement('canvas'), x = c.getContext('2d'), size = 140;
  x.font = `${size}px ${f[2]}`;
  const w = Math.ceil(x.measureText(spec.text).width) + 60;
  c.width = Math.min(2400, w); c.height = Math.round(size * 1.6);
  x.font = `${size}px ${f[2]}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  if (spec.outline && spec.outline !== 'none') { x.strokeStyle = spec.outline; x.lineWidth = 16; x.strokeText(spec.text, c.width / 2, c.height / 2); }
  x.fillStyle = spec.fill || '#ffffff'; x.fillText(spec.text, c.width / 2, c.height / 2);
  return trim(c).toDataURL('image/png');
}
function trim(c) {
  const x = c.getContext('2d'), { data } = x.getImageData(0, 0, c.width, c.height);
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y++) for (let i = 0; i < c.width; i++) if (data[(y * c.width + i) * 4 + 3] > 8) { x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 <= x0) return c;
  const o = document.createElement('canvas'); o.width = x1 - x0 + 8; o.height = y1 - y0 + 8;
  o.getContext('2d').drawImage(c, x0 - 4, y0 - 4, o.width, o.height, 0, 0, o.width, o.height); return o;
}

// ---------- uploads ----------
function loadImage(src) { return new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = src; }); }
async function processUpload(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url), max = 900, k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  } finally { URL.revokeObjectURL(url); }
}
async function removeBackground(src) { // makes the corner color (usually a white/black background) transparent
  const img = await loadImage(src), c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data, W = c.width, H = c.height;
  const corners = [0, W - 1, (H - 1) * W, H * W - 1].map(i => [p[i * 4], p[i * 4 + 1], p[i * 4 + 2]]);
  const bg = corners.reduce((a, b) => a.map((v, i) => v + b[i] / 4), [0, 0, 0]);
  // flood fill from the edges so only the background (not matching colors inside the logo) disappears
  const seen = new Uint8Array(W * H), q = [];
  const near = i => Math.hypot(p[i * 4] - bg[0], p[i * 4 + 1] - bg[1], p[i * 4 + 2] - bg[2]);
  for (let i = 0; i < W; i++) q.push(i, (H - 1) * W + i); for (let j = 0; j < H; j++) q.push(j * W, j * W + W - 1);
  while (q.length) {
    const i = q.pop(); if (seen[i]) continue; seen[i] = 1;
    const dd = near(i); if (dd > 60) continue;
    p[i * 4 + 3] = dd < 34 ? 0 : Math.round(p[i * 4 + 3] * (dd - 34) / 26);
    const xx = i % W, yy = (i / W) | 0;
    if (xx > 0) q.push(i - 1); if (xx < W - 1) q.push(i + 1); if (yy > 0) q.push(i - W); if (yy < H - 1) q.push(i + W);
  }
  x.putImageData(d, 0, 0); return trim(c).toDataURL('image/png');
}

// ---------- state ----------
function merge(def, got) {
  const out = clone(def);
  if (!got || typeof got !== 'object') return out;
  Object.keys(got).forEach(k => {
    if (def[k] && typeof def[k] === 'object' && !Array.isArray(def[k]) && got[k] && typeof got[k] === 'object') out[k] = merge(def[k], got[k]);
    else if (got[k] !== undefined) out[k] = got[k];
  });
  return out;
}
const b64 = { enc: s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
              dec: s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))) };
const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } } };
const uid = () => Math.random().toString(36).slice(2, 9);
let D;
(function init() {
  const m = location.hash.match(/d=([\w-]+)/);
  if (m) { try { D = merge(BASE, JSON.parse(b64.dec(m[1]))); history.replaceState(null, '', location.pathname); } catch (e) { D = null; } }
  if (!D) { const cur = store.get('synq-traje3d-current'); D = cur ? merge(BASE, cur) : clone(PRESETS[0]); }
  if (!D.name) D.name = t('myDesign');
})();

// images the suit can use: uploads (saved in the design), ready-made designs and lettering (made on the fly)
const IMG = {}; window.__IMG = IMG; // (handy for debugging)
async function ensureImages() {
  const ids = new Set(Object.keys(D.images));
  D.decals.forEach(dc => ids.add(dc.imageId)); if (D.print && D.print.imageId) ids.add(D.print.imageId);
  for (const id of ids) {
    if (IMG[id]) continue;
    let src = D.images[id];
    if (!src && id.startsWith('m:')) { const [, name, col] = id.split(':'); if (MOTIFS[name]) src = motifImage(name, col); }
    if (!src && id.startsWith('t:')) { try { src = await textImage(JSON.parse(b64.dec(id.slice(2)))); } catch (e) {} }
    if (src) { try { IMG[id] = await loadImage(src); } catch (e) {} }
  }
}

// ---------- the 3D studio ----------
const viewport = document.getElementById('viewport');
const studio = createStudio(viewport);
let saveTimer;
function persist() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { if (!store.set('synq-traje3d-current', D)) toast(t('tooBig')); }, 300); }
async function rebuild() { await ensureImages(); studio.setDesign(D, IMG); persist(); }
async function relook() { await ensureImages(); studio.setLook(D, IMG); persist(); }
function shape(fn) { fn(D); rebuild(); buildPane(current); }
function color(fn, rebuildPane) { fn(D); relook(); if (rebuildPane !== false) buildPane(current); }

// ---------- small UI helpers ----------
const $ = (s, r) => (r || document).querySelector(s);
const h = (tag, attrs, kids) => {
  const e = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v == null || v === false) return;
    if (k === 'on') Object.entries(v).forEach(([ev, fn]) => e.addEventListener(ev, fn));
    else e.setAttribute(k, v === true ? '' : v);
  });
  (kids || []).forEach(c => c != null && e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return e;
};
const group = (title, kids, hint) => h('div', { class: 'group' }, [title ? h('h3', {}, [title]) : null, hint ? h('p', { class: 'hint' }, [hint]) : null].concat(kids));
const opts = (items, value, onPick) => h('div', { class: 'opts' }, items.map(([v, label]) => h('button', { type: 'button', class: 'opt', 'aria-pressed': String(v === value), on: { click: () => onPick(v) } }, [label])));
const seg = (items, value, onPick) => h('span', { class: 'seg' }, items.map(([v, label]) => h('button', { type: 'button', 'aria-pressed': String(v === value), on: { click: () => onPick(v) } }, [label])));
const colorName = hex => { const c = COLORS.find(x => x[0].toLowerCase() === String(hex).toLowerCase()); return c ? (lang === 'es' ? c[1] : c[2]) : String(hex).toUpperCase(); };
function swatches(value, onPick, small) {
  return h('div', { class: small ? 'mini' : 'swatches' }, COLORS.map(([hex, es, en]) =>
    h('button', { type: 'button', class: 'sw', title: lang === 'es' ? es : en, 'aria-label': lang === 'es' ? es : en, 'aria-pressed': String(hex.toLowerCase() === String(value).toLowerCase()), style: 'background:' + hex, on: { click: () => onPick(hex) } })));
}
// ---------- color wheel ----------
const hex2rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const rgb2hex = (r, g, b) => '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
function rgb2hsv(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx]; }
function hsv2rgb(h, s, v) { const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c; const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return [(r + m) * 255, (g + m) * 255, (b + m) * 255]; }
function remember(hex) { const r = (store.get('synq-recent-colors') || []).filter(x => x !== hex); r.unshift(hex); store.set('synq-recent-colors', r.slice(0, 10)); }
function colorWheel(value, onPick) {
  let [H, S, V] = rgb2hsv(...hex2rgb(value || '#ffffff'));
  const SZ = 210, DPR = 2, wrap = h('div', { class: 'cw' });
  const cv = h('canvas', { width: SZ * DPR, height: SZ * DPR, class: 'cw__disc', 'aria-label': t('color') }), ctx = cv.getContext('2d');
  const dot = h('span', { class: 'cw__dot' }), discBox = h('div', { class: 'cw__discbox' }, [cv, dot]);
  const bright = h('input', { type: 'range', min: 0, max: 100, step: 1, class: 'cw__bright', 'aria-label': t('bright') });
  const hexIn = h('input', { type: 'text', maxlength: 7, class: 'cw__hex', 'aria-label': 'HEX' });
  const chip = h('span', { class: 'cw__chip' });
  function drawDisc() {
    const N = SZ * DPR, img = ctx.createImageData(N, N), R = N / 2;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const dx = x - R, dy = y - R, d = Math.sqrt(dx * dx + dy * dy); if (d > R) continue;
      const [r, g, b] = hsv2rgb((Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360, Math.min(1, d / R), V), o = (y * N + x) * 4;
      const edge = Math.min(1, (R - d)); img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255 * edge;
    }
    ctx.putImageData(img, 0, 0);
  }
  function sync(emit, live) {
    const hex = rgb2hex(...hsv2rgb(H, S, V));
    const a = H * Math.PI / 180, r = S * SZ / 2;
    dot.style.left = (SZ / 2 + Math.cos(a) * r) + 'px'; dot.style.top = (SZ / 2 + Math.sin(a) * r) + 'px'; dot.style.background = hex;
    bright.value = Math.round(V * 100); bright.style.background = `linear-gradient(90deg, #000, ${rgb2hex(...hsv2rgb(H, S, 1))})`;
    if (document.activeElement !== hexIn) hexIn.value = hex.toUpperCase(); chip.style.background = hex;
    if (emit) { onPick(hex, live); if (!live) remember(hex); }
  }
  let raf = 0, pend = null;
  const live = () => { pend = true; if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (pend) { pend = false; sync(true, true); } }); };
  const fromPointer = e => { const r = cv.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2; H = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360; S = Math.min(1, Math.hypot(dx, dy) / (r.width / 2)); if (V < 0.08) { V = 0.9; drawDisc(); } };
  let dragging = false;
  discBox.addEventListener('pointerdown', e => { dragging = true; discBox.setPointerCapture(e.pointerId); fromPointer(e); sync(false); live(); e.preventDefault(); });
  discBox.addEventListener('pointermove', e => { if (!dragging) return; fromPointer(e); sync(false); live(); });
  const up = () => { if (!dragging) return; dragging = false; sync(true, false); };
  discBox.addEventListener('pointerup', up); discBox.addEventListener('pointercancel', up);
  bright.addEventListener('input', () => { V = bright.value / 100; drawDisc(); sync(false); live(); });
  bright.addEventListener('change', () => sync(true, false));
  hexIn.addEventListener('change', () => { let v = hexIn.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v)) { [H, S, V] = rgb2hsv(...hex2rgb(v)); drawDisc(); sync(true, false); } else sync(false); });
  const row = h('div', { class: 'cw__row' }, [chip, hexIn]);
  if (window.EyeDropper) row.appendChild(h('button', { type: 'button', class: 'cw__eye', title: t('pickScreen'), 'aria-label': t('pickScreen'), on: { click: async () => { try { const r = await new EyeDropper().open(); [H, S, V] = rgb2hsv(...hex2rgb(r.sRGBHex)); drawDisc(); sync(true, false); } catch (e) {} } } }, ['💧']));
  const recent = (store.get('synq-recent-colors') || []);
  wrap.append(discBox, h('label', { class: 'cw__label' }, [t('bright'), bright]), row);
  if (recent.length) wrap.append(h('div', { class: 'hint', style: 'margin:10px 0 4px' }, [t('recent')]), h('div', { class: 'mini' }, recent.map(c => h('button', { type: 'button', class: 'sw', style: 'background:' + c, 'aria-label': c, on: { click: () => { [H, S, V] = rgb2hsv(...hex2rgb(c)); drawDisc(); sync(true, false); } } }))));
  drawDisc(); sync(false);
  return wrap;
}
function exact(value, onPick) {
  const txt = h('input', { type: 'text', value: String(value).toUpperCase(), maxlength: 7, 'aria-label': t('exact') });
  const pick = h('input', { type: 'color', value, 'aria-label': t('exact') });
  pick.addEventListener('input', () => { txt.value = pick.value.toUpperCase(); onPick(pick.value, true); });
  pick.addEventListener('change', () => onPick(pick.value));
  txt.addEventListener('change', () => { let v = txt.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v)) onPick(v.toLowerCase()); else txt.value = String(value).toUpperCase(); });
  return h('div', { class: 'exact' }, [h('span', {}, [t('exact')]), pick, txt]);
}
function toggle(label, checked, onSet) {
  const i = h('input', { type: 'checkbox' }); i.checked = !!checked; i.addEventListener('change', () => onSet(i.checked));
  return h('label', { class: 'switch' }, [h('span', {}, [label]), i]);
}
function slider(label, min, max, step, value, fmt, onInput) {
  const out = h('output', {}, [fmt(value)]);
  const i = h('input', { type: 'range', min, max, step, value, 'aria-label': label });
  i.addEventListener('input', () => { out.textContent = fmt(+i.value); onInput(+i.value, true); });
  i.addEventListener('change', () => onInput(+i.value, false));
  return h('label', { class: 'slider' }, [h('span', {}, [label]), i, out]);
}
function thumb(id, pressed, onClick, onRemove) {
  const b = h('button', { type: 'button', class: 'thumb', 'aria-pressed': String(!!pressed), on: { click: onClick } }, [IMG[id] ? h('img', { src: IMG[id].src, alt: '' }) : null]);
  if (onRemove) { const x = h('span', { class: 'x', role: 'button', 'aria-label': t('del'), on: { click: e => { e.stopPropagation(); onRemove(); } } }, ['×']); b.appendChild(x); }
  return b;
}

// ---------- quick spots (wearer's left = +x) ----------
const SPOTS = [
  ['back', 'spBack', [0, 1.27, -0.25], [0, 0, -1], 0.3, 'embroidery', 'body'],
  ['chestL', 'spChestL', [0.09, 1.3, 0.2], [0.3, 0, 1], 0.1, 'patch', 'body'],
  ['chestR', 'spChestR', [-0.09, 1.3, 0.2], [-0.3, 0, 1], 0.1, 'patch', 'body'],
  ['armL', 'spArmL', [0.32, 1.23, 0.0], [1, 0, 0], 0.085, 'patch', 'sleeves'],
  ['armR', 'spArmR', [-0.32, 1.23, 0.0], [-1, 0, 0], 0.085, 'patch', 'sleeves'],
  ['legL', 'spLegL', [0.13, 0.7, 0.15], [0.35, 0, 1], 0.11, 'patch', 'pants'],
  ['legR', 'spLegR', [-0.13, 0.7, 0.15], [-0.35, 0, 1], 0.11, 'patch', 'pants'],
];
function quickPlace(imageId, spot) {
  const [, , point, normal, size, tech, part] = SPOTS.find(x => x[0] === spot);
  const img = IMG[imageId], ar = img ? img.width / img.height : 1;
  const dc = { id: uid(), imageId, tech: imageId.startsWith('m:') && tech === 'patch' ? 'embroidery' : tech, point, normal, part, size: ar > 2.5 ? Math.min(0.4, size * 1.6) : size, rot: spot.startsWith('arm') && ar > 2.5 ? 90 : 0, patchColor: '#111111', threadColor: '#d4a63c' };
  D.decals.push(dc); selectedDecal = dc.id; studio.updateDecal(dc); persist();
  studio.view(spot === 'back' ? 'back' : spot.endsWith('L') && spot.startsWith('arm') ? 'left' : spot.endsWith('R') && spot.startsWith('arm') ? 'right' : 'front');
  buildPane('logos'); toast(t('placedOk')); count('trajes-place', 'Placed an image on the suit');
}
const spotButtons = id => h('div', {}, [h('div', { class: 'acc__label' }, [t('quick')]), h('div', { class: 'opts' }, SPOTS.map(([k, l]) => h('button', { type: 'button', class: 'opt', on: { click: () => quickPlace(id, k) } }, [t(l)]))),
  h('div', { class: 'row' }, [h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: () => startPlacing(id) } }, ['✋ ' + t('orTap')])])]);

// ---------- placing images on the suit ----------
let selectedImage = null, selectedDecal = null, placing = false;
function startPlacing(imageId) {
  selectedImage = imageId; placing = true;
  if (matchMedia('(max-width: 900px)').matches) document.documentElement.style.setProperty('--sheet', '96px');
  $('#placing').hidden = false; viewport.classList.add('is-placing');
  if (matchMedia('(max-width: 900px)').matches) viewport.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function stopPlacing() { window.__sheetRestore && window.__sheetRestore(); placing = false; $('#placing').hidden = true; viewport.classList.remove('is-placing'); }
$('#cancelPlace').addEventListener('click', stopPlacing);

let drag = null;
viewport.addEventListener('pointerdown', () => { const hnt = $('.hint3d'); if (hnt) hnt.style.opacity = '0'; }, { once: true });
viewport.addEventListener('pointerdown', e => {
  if (e.target.closest('.views, .placing')) return;
  if (placing) {
    const hit = studio.pick(e.clientX, e.clientY); if (!hit) return;
    e.stopPropagation(); e.preventDefault();
    const img = IMG[selectedImage], ar = img ? img.width / img.height : 1;
    const dc = { id: uid(), imageId: selectedImage, tech: selectedImage.startsWith('u:') ? 'print' : 'embroidery', point: hit.point, normal: hit.normal, part: hit.part, size: ar > 2.5 ? 0.3 : 0.14, rot: 0, patchColor: '#111111', threadColor: '#d4a63c' };
    D.decals.push(dc); selectedDecal = dc.id; stopPlacing();
    studio.updateDecal(dc); persist(); current = 'logos'; buildTabs(); buildPane('logos'); toast(t('placedOk'));
    count('trajes-place', 'Placed an image on the suit');
    return;
  }
  const id = studio.pickDecal(e.clientX, e.clientY);
  if (id) {
    e.stopPropagation(); e.preventDefault();
    selectedDecal = id; drag = { id, pointer: e.pointerId };
    studio.controls.enabled = false; viewport.setPointerCapture(e.pointerId);
    if (current === 'logos') markSelected(); else { current = 'logos'; buildTabs(); buildPane('logos'); }
  }
}, { capture: true });
let dragRaf = 0;
viewport.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.pointer) return;
  cancelAnimationFrame(dragRaf);
  const cx = e.clientX, cy = e.clientY;
  dragRaf = requestAnimationFrame(() => {
    const hit = studio.pick(cx, cy); if (!hit) return;
    const dc = D.decals.find(x => x.id === drag.id); if (!dc) return;
    dc.point = hit.point; dc.normal = hit.normal; dc.part = hit.part; studio.updateDecal(dc);
  });
});
const endDrag = () => { if (!drag) return; drag = null; studio.controls.enabled = true; persist(); buildPane(current); };
viewport.addEventListener('pointerup', endDrag); viewport.addEventListener('pointercancel', endDrag);

function where(dc) { // plain-language spot for the tailor
  const [x, y, z] = dc.point, [nx, , nz] = dc.normal, side = Math.abs(x) < 0.03 ? t('centered') : x > 0 ? t('left') : t('right');
  if (dc.part === 'pants') return `${x > 0 ? t('locPantsL') : t('locPantsR')} · ${Math.round((y - 0.035) * 100)} ${t('aboveHem')}`;
  if (dc.part === 'sleeves') return `${x > 0 ? t('locSleeveL') : t('locSleeveR')} · ${Math.max(0, Math.round((1.4 - y) * 100))} ${t('fromShoulder')}`;
  const loc = nz > 0.45 ? t('locFront') : nz < -0.45 ? t('locBack') : t('locSide');
  return `${loc} · ${side} · ${Math.max(0, Math.round((1.48 - y) * 100))} ${t('belowCollar')}`;
}
function markSelected() { document.querySelectorAll('.placed').forEach(c => c.setAttribute('aria-current', String(c.dataset.id === selectedDecal))); }
function faceDecal(dc) { const [nx, , nz] = dc.normal; studio.view(Math.abs(nz) >= Math.abs(nx) ? (nz > 0 ? 'front' : 'back') : (nx > 0 ? 'left' : 'right')); }

// ---------- tabs and panes ----------
const TABS = [['styles', 'tStyles'], ['cut', 'tPieces'], ['fabric', 'tFabric'], ['stones', 'tStonesTab'], ['logos', 'tLogos'], ['print', 'tPrint'], ['text', 'tText'], ['band', 'tBand']];
let current = store.get('synq-traje3d-tab') || 'styles', zone = 'body';
const tabsEl = $('#tabs'), panes = $('#panes');
function buildTabs() {
  tabsEl.innerHTML = '';
  TABS.forEach(([k, label]) => tabsEl.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': String(k === current), on: { click: () => { current = k; store.set('synq-traje3d-tab', k); buildTabs(); buildPane(k); window.__sheetOpen && window.__sheetOpen(); } } }, [t(label)])));
}
const fileInput = $('#fileInput');
fileInput.addEventListener('change', async () => { await addFiles([...fileInput.files]); fileInput.value = ''; });
async function addFiles(files) {
  let last = null;
  for (const f of files) {
    if (!f.type.startsWith('image/')) continue;
    try { const src = await processUpload(f), id = 'u:' + uid(); D.images[id] = src; IMG[id] = await loadImage(src); last = id; } catch (e) {}
  }
  if (last) { selectedImage = last; persist(); buildPane('logos'); count('trajes-upload', 'Uploaded an image'); }
}

const PANES = {
  styles() {
    const card = p => h('button', { type: 'button', class: 'tpl', on: { click: () => {
      // keep the person's own logos and print; drop anything that came from another starter look
      const mineDecals = D.decals.filter(dc => !dc.fromLook);
      const keep = { images: D.images, members: D.members, notes: D.notes, jacket: undefined, pantsCfg: undefined };
      D = Object.assign(clone(p), keep);
      D.decals = D.decals.map(dc => Object.assign(dc, { fromLook: true })).concat(mineDecals);
      if (!p.print && keep.images && D.print == null) { const old = JSON.parse(JSON.stringify(window.__lastUserPrint || null)); if (old) D.print = old; } $('#designName').value = D.name; rebuild(); toast(p.name);
    } } }, [h('span', { class: 'tpl__sw' }, [p.parts.body.color, p.parts.sleeves.color, p.parts.collar.color, p.parts.pants.color].map(c => h('i', { style: 'background:' + c }))),
      h('b', {}, [p.name]), h('small', {}, [[t((FABRICS.find(f => f[0] === p.parts.body.fabric) || FABRICS[0])[1]), t({ blazer: 'sBlazer', bomber: 'sBomber', varsity: 'sVarsity', western: 'sWestern' }[p.style] || 'sBlazer')].join(' · ')])]);
    const groups = [['banda', 'catBanda'], ['norteno', 'catNorteno'], ['moderno', 'catModerno'], ['gala', 'catGala']].map(([c, l]) => {
      const list = PRESETS.filter(p => (p.cat || CATS[p.name] || 'moderno') === c);
      return list.length ? group(t(l) + ' · ' + list.length, [h('div', { class: 'tpls' }, list.map(card))]) : null;
    });
    return [h('p', { class: 'hint' }, [t('stylesHelp')])].concat(groups);
  },
  cut() {
    const J = jacketCfg(D), setJ = (key, v) => shape(d => { d.jacket = Object.assign(jacketCfg(d), { [key]: v }); });
    const PN = Object.assign({ fit: 0.3, belt: true, turnups: false }, D.pantsCfg || {}), setP = (key, v) => shape(d => { d.pantsCfg = Object.assign({ fit: 0.3, belt: true, turnups: false }, d.pantsCfg || {}, { [key]: v }); });
    const lapel = ['notch', 'peak', 'shawl'].includes(J.collar);
    const sec = (title, kids, openIt) => { const el = h('details', { class: 'acc', open: openIt }, [h('summary', {}, [title])].concat([h('div', { class: 'acc__body' }, kids.filter(Boolean))])); return el; };
    const lab = l => h('div', { class: 'acc__label' }, [l]);
    const fitSlider = (v, onSet) => slider(t('fit'), 0, 100, 1, Math.round(v * 100), x => x < 30 ? t('fitSlim') : x > 65 ? t('fitLoose') : (lang === 'es' ? 'Normal' : 'Regular'), (x, live) => { if (!live) onSet(x / 100); });
    const jacket = sec(t('secJacket'), [
      lab(t('startFrom')), opts([['blazer', t('sBlazer')], ['bomber', t('sBomber')], ['varsity', t('sVarsity')], ['western', t('sWestern')]], D.jacket ? null : D.style, v => shape(d => { d.style = v; delete d.jacket; })),
      slider(t('length'), 52, 76, 1, Math.round((1.5 - J.length) * 100), x => x + ' cm', (x, live) => { if (!live) setJ('length', 1.5 - x / 100); }),
      fitSlider(J.fit, v => setJ('fit', v)),
      lab(t('collar')), opts([['notch', t('cNotch')], ['peak', t('cPeak')], ['shawl', t('cShawl')], ['stand', t('cStand')], ['rib', t('cRib')], ['shirt', t('cShirt')], ['none', t('cNone')]], J.collar, v => setJ('collar', v)),
      lab(t('closure')), opts((lapel ? [['buttons', t('clButtons')]] : [['buttons', t('clButtons')], ['zipper', t('clZipper')], ['snaps', t('clSnaps')], ['open', t('clOpen')]]), lapel ? 'buttons' : J.closure, v => setJ('closure', v)),
      (J.closure === 'buttons' || J.closure === 'snaps' || lapel) ? slider(t('count'), 1, lapel ? 3 : 8, 1, Math.max(1, J.buttons || 1), x => String(x), (x, live) => { if (!live) setJ('buttons', x); }) : null,
      lab(t('pockets')), opts([['none', t('pkNone')], ['flap', t('pkFlap')], ['welt', t('pkWelt')], ['zip', t('pkZip')], ['patch', t('pkPatch')]], J.pockets, v => setJ('pockets', v)),
      toggle(t('chestPocket'), J.chestPocket, v => setJ('chestPocket', v)),
      J.pockets !== 'none' || J.chestPocket ? toggle(t('pocketContrast'), J.pocketContrast, v => setJ('pocketContrast', v)) : null,
      lab(t('cuffsT')), opts([['plain', t('cfPlain')], ['contrast', t('cfContrast')], ['rib', t('cfRib')], ['buttons', t('cfButtons')]], J.cuffs, v => setJ('cuffs', v)),
      lab(t('hemT')), opts([['plain', t('hmPlain')], ['rib', t('hmRib')]], J.hem, v => setJ('hem', v)),
      lab(t('yokeT')), opts([['none', t('ykNone')], ['western', t('ykWestern')], ['straight', t('ykStraight')]], J.yoke, v => setJ('yoke', v)),
      toggle(t('epaulettes'), J.epaulettes, v => setJ('epaulettes', v)),
      toggle(t('sleeveStripes'), D.sleeveStripes, v => shape(d => { d.sleeveStripes = v; })),
    ], true);
    const pants = sec(t('secPants'), [
      fitSlider(PN.fit, v => setP('fit', v)),
      lab(t('stripes')), opts([['none', t('none')], ['one', t('one')], ['two', t('two')]], D.stripes, v => shape(d => { d.stripes = v; })),
      toggle(t('turnups'), PN.turnups, v => setP('turnups', v)), toggle(t('belt'), PN.belt, v => setP('belt', v)),
    ]);
    const shirt = sec(t('secShirt'), [
      lab(t('shirtT')), opts([['dress', t('shDress')], ['tee', t('shTee')], ['turtle', t('shTurtle')]], D.shirt || 'dress', v => shape(d => { d.shirt = v; })),
      (D.shirt || 'dress') === 'dress' ? lab(t('neck')) : null, (D.shirt || 'dress') === 'dress' ? opts([['bow', t('nBow')], ['tie', t('nTie')], ['none', t('nNone')]], D.neckwear, v => shape(d => { d.neckwear = v; })) : null,
      toggle(t('chain'), D.chain, v => shape(d => { d.chain = v; })),
    ]);
    const shoes = sec(t('secShoes'), [
      lab(t('shoesT')), opts([['boots', t('soBoots')], ['sneakers', t('soSneakers')], ['dress', t('soDress')]], D.shoes || 'boots', v => shape(d => { d.shoes = v; })),
      toggle(t('hatShow'), D.hat, v => shape(d => { d.hat = v; })),
    ]);
    const panels = sec(t('secPanels'), [h('p', { class: 'hint' }, [t('panelsHelp')])].concat([['shoulders', 'panShoulders'], ['sides', 'panSides'], ['legs', 'panLegs']].map(([key, l]) => toggle(t(l), D.panels[key], v => shape(d => { d.panels[key] = v; })))).concat([
      D.panels.sides ? slider(t('stripeWidth') + ' · ' + t('secJacket'), 4, 30, 1, Math.round((D.panels.sideWidth || 0.38) * 38), x => x + ' cm', (x, live) => { if (!live) shape(d => { d.panels.sideWidth = x / 38; }); }) : null,
      D.panels.legs ? slider(t('stripeWidth') + ' · ' + t('secPants'), 2, 16, 1, Math.round((D.panels.legWidth || 0.5) * 16), x => x + ' cm', (x, live) => { if (!live) shape(d => { d.panels.legWidth = x / 16; }); }) : null,
      h('button', { type: 'button', class: 'btn btn--ghost btn--sm', style: 'margin-top:8px', on: { click: () => { zone = 'panel'; current = 'fabric'; buildTabs(); buildPane('fabric'); } } }, [t('fabric') + ' / ' + t('color') + ' →'])]));
    const pp = D.piping, pipOpts = [['sides', 'pipSides'], ['racing', 'pipRacing'], ['lapels', 'pipLapels'], ['front', 'pipFront'], ['sleeves', 'pipSleeves'], ['cuffs', 'pipCuffs'], ['pants', 'pipPants']]
      .filter(([key]) => !(key === 'lapels' && !lapel) && !(key === 'front' && lapel));
    const piping = sec(t('secPiping'), [toggle(t('pipOn'), pp.on, v => shape(d => { d.piping.on = v; }))].concat(pp.on ? pipOpts.map(([key, l]) => toggle(t(l), pp[key], v => shape(d => { d.piping[key] = v; })))
      .concat([slider(t('pipSize'), 2, 8, 0.5, +(pp.size * 2000).toFixed(1), v => v.toFixed(1) + ' mm', (v, live) => { if (!live) shape(d => { d.piping.size = v / 2000; }); }),
        h('button', { type: 'button', class: 'btn btn--ghost btn--sm', style: 'margin-top:8px', on: { click: () => { zone = 'piping'; current = 'fabric'; buildTabs(); buildPane('fabric'); } } }, [t('color') + ' →'])]) : []));
    const mq = sec(t('secMannequin'), [opts([['faceless-white', t('mqWhite')], ['faceless-black', t('mqBlack')], ['carved', t('mqCarved')], ['headless', t('mqHeadless')], ['ghost', t('mqGhost')], ['human', t('mqHuman')]], D.mannequin || 'faceless-white', v => shape(d => { d.mannequin = v; }))]);
    const hw = sec(t('secHardware'), [opts([['gold', t('gold')], ['silver', t('silver')], ['black', t('black')]], D.hardware, v => color(d => { d.hardware = v; }))]);
    // remember which sections are open while editing
    const keep = store.get('synq-acc') || { 0: true };
    const all = [jacket, pants, shirt, shoes, mq, panels, piping, hw];
    all.forEach((el, i) => { el.open = !!keep[i]; el.addEventListener('toggle', () => { keep[i] = el.open; store.set('synq-acc', keep); }); });
    return all;
  },
  fabric() {
    const zones = h('div', { class: 'zones' }, PARTS.map(([key, label]) => h('button', { type: 'button', class: 'zone', 'aria-pressed': String(key === zone), on: { click: () => { zone = key; buildPane('fabric'); } } },
      [h('i', { style: 'background:' + D.parts[key].color }), h('span', {}, [t(label), h('small', {}, [t((FABRICS.find(f => f[0] === D.parts[key].fabric) || FABRICS[0])[1])])])])));
    const label = t((PARTS.find(p => p[0] === zone) || PARTS[0])[1]);
    return [group(t('part'), [zones]),
      group(t('fabric') + ' · ' + label, [opts(FABRICS.map(([f, l]) => [f, t(l)]), D.parts[zone].fabric, v => color(d => { d.parts[zone].fabric = v; }))]),
      group(t('color') + ' · ' + label, [colorWheel(D.parts[zone].color, (v, live) => color(d => { d.parts[zone].color = v; }, !live)), h('div', { class: 'hint', style: 'margin:12px 0 4px' }, [t('refColors')]), h('div', { class: 'mini' }, REF_COLORS.map(([c, n]) => h('button', { type: 'button', class: 'sw', title: n, 'aria-label': n, style: 'background:' + c, on: { click: () => { remember(c); color(d => { d.parts[zone].color = c; }); } } }))), h('div', { class: 'hint', style: 'margin:12px 0 4px' }, [t('quick')]), swatches(D.parts[zone].color, v => { remember(v); color(d => { d.parts[zone].color = v; }); }, true)]),
      ['body', 'sleeves', 'pants', 'collar', 'cuffs', 'panel'].includes(zone) ? h('div', { class: 'acc__label' }, [t('topBottom')]) : null,
      ['body', 'sleeves', 'pants', 'collar', 'cuffs', 'panel'].includes(zone) ? h('div', { class: 'row' }, [
        h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: () => color(d => { ['body', 'sleeves'].forEach(k => { d.parts[k] = clone(d.parts[zone]); }); }) } }, [t('toJacket')]),
        h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: () => color(d => { d.parts.pants = clone(d.parts[zone]); }) } }, [t('toPants')])]) : null,
      ['body', 'sleeves', 'pants'].includes(zone) ? h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: () => color(d => { ['body', 'sleeves', 'pants'].forEach(k => { d.parts[k] = clone(d.parts[zone]); }); }) } }, [t('applyAll')]) : null];
  },
  stones() {
    const st = D.stones, ch = (fn, live) => { fn(D.stones); studio.setStones(D); persist(); if (!live) buildPane('stones'); };
    const edges = [['lapels', 'eLapels'], ['front', 'eFront'], ['cuffs', 'eCuffs'], ['pockets', 'ePockets'], ['stripes', 'eStripes'], ['hem', 'eHem']]
      .filter(([k]) => !((k === 'lapels' || k === 'pockets') && D.style !== 'blazer') && !(k === 'stripes' && D.stripes === 'none'));
    return [group(t('gemColor'), [h('div', { class: 'opts' }, GEMS.map(([k, l, bg]) => h('button', { type: 'button', class: 'opt', 'aria-pressed': String(st.color === k), on: { click: () => ch(x => { x.color = k; }) } }, [h('i', { style: `width:16px;height:16px;border-radius:50%;background:${bg}` }), t(l)]))),
        slider(t('gemSize'), 3, 10, 0.5, +((st.size || 0.0032) * 2000).toFixed(1), v => v.toFixed(1) + ' mm', (v, live) => ch(x => { x.size = v / 2000; }, live))]),
      group(t('edges'), edges.map(([k, l]) => toggle(t(l), st.edges[k], v => ch(x => { x.edges[k] = v; })))),
      group(t('scatter'), [['body', 'sBody'], ['sleeves', 'sSleeves'], ['pants', 'sPants']].map(([k, l]) => slider(t(l), 0, 100, 1, st.scatter[k] || 0, v => v + '%', (v, live) => ch(x => { x.scatter[k] = v; }, live))), t('scatterHelp'))];
  },
  logos() {
    const drop = h('button', { type: 'button', class: 'drop', on: { click: () => fileInput.click() } }, [h('b', {}, [t('upload')]), t('uploadHelp')]);
    ['dragover', 'dragenter'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => addFiles([...e.dataTransfer.files]));
    const mine = Object.keys(D.images);
    const kids = [group('', [h('div', { class: 'uploader' }, [drop])])];
    if (mine.length) {
      kids.push(group(t('yourImages'), [h('div', { class: 'gallery' }, mine.map(id => thumb(id, id === selectedImage, () => { selectedImage = id; buildPane('logos'); },
        () => { delete D.images[id]; delete IMG[id]; D.decals = D.decals.filter(dc => dc.imageId !== id); if (D.print && D.print.imageId === id) D.print = null; persist(); rebuild(); buildPane('logos'); }))),
        selectedImage && D.images[selectedImage] ? h('div', { class: 'row' }, [
          spotButtons(selectedImage),
          h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: async () => { const id = selectedImage; D.images[id] = await removeBackground(D.images[id]); IMG[id] = await loadImage(D.images[id]); studio.clearDecalCache(); rebuild(); buildPane('logos'); } } }, [t('removeBg')]),
        ]) : null]));
    }
    // ready-made designs
    const ready = [];
    Object.keys(MOTIFS).forEach(name => ['gold', 'silver'].forEach(col => ready.push('m:' + name + ':' + col)));
    kids.push(group(t('designs'), [h('div', { class: 'gallery' }, ready.map(id => {
      if (!IMG[id]) { const [, name, col] = id.split(':'); const i = new Image(); i.src = motifImage(name, col); IMG[id] = i; }
      return thumb(id, id === selectedImage, () => { selectedImage = id; buildPane('logos'); });
    })), selectedImage && selectedImage.startsWith('m:') ? spotButtons(selectedImage) : null]));
    // what's on the suit
    const list = D.decals.map(dc => {
      const card = h('div', { class: 'placed', 'data-id': dc.id, 'aria-current': String(dc.id === selectedDecal), on: { click: e => { if (e.target.closest('button, input')) return; selectedDecal = dc.id; markSelected(); faceDecal(dc); } } });
      const upd = (live) => { studio.updateDecal(dc); if (!live) persist(); };
      card.append(
        h('div', { class: 'placed__head' }, [h('div', { class: 'thumb' }, [IMG[dc.imageId] ? h('img', { src: IMG[dc.imageId].src, alt: '' }) : null]), h('b', {}, [t(TECHS.find(x => x[0] === dc.tech)[1]), h('small', {}, [where(dc)])])]),
        h('div', {}, [seg(TECHS.map(([k, l]) => [k, t(l)]), dc.tech, v => { dc.tech = v; upd(); buildPane('logos'); })]),
        slider(t('size'), 3, 60, 1, Math.round(dc.size * 100), v => v + ' cm', (v, live) => { dc.size = v / 100; upd(live); }),
        slider(t('rotate'), -180, 180, 1, dc.rot || 0, v => v + '°', (v, live) => { dc.rot = v; upd(live); }),
      );
      if (dc.tech === 'patch') card.append(h('div', { class: 'hint', style: 'margin:8px 0 2px' }, [t('patchColor')]), swatches(dc.patchColor, v => { dc.patchColor = v; studio.clearDecalCache(); upd(); buildPane('logos'); }, true),
        h('div', { class: 'hint', style: 'margin:8px 0 2px' }, [t('threadColor')]), swatches(dc.threadColor, v => { dc.threadColor = v; studio.clearDecalCache(); upd(); buildPane('logos'); }, true));
      card.append(h('div', { class: 'row' }, [
        h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: () => { const c = Object.assign(clone(dc), { id: uid(), point: [-dc.point[0], dc.point[1], dc.point[2]], normal: [-dc.normal[0], dc.normal[1], dc.normal[2]], rot: -(dc.rot || 0) }); D.decals.push(c); studio.updateDecal(c); persist(); buildPane('logos'); } } }, [t('mirror')]),
        h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: () => { D.decals = D.decals.filter(x => x.id !== dc.id); studio.refreshDecals(); persist(); buildPane('logos'); } } }, [t('del')]),
      ]));
      return card;
    });
    kids.push(group(t('onSuit'), list.length ? list : [h('p', { class: 'hint' }, [t('nothingPlaced')])], list.length ? t('dragToMove') : null));
    return kids;
  },
  print() {
    const mine = Object.keys(D.images);
    const pr = D.print || { imageId: null, pattern: null, color: '#d4a63c', parts: ['body', 'sleeves', 'pants'], size: 0.1, gap: 0.07, rotate: 0 };
    const setPr = (fn, live) => { const p = D.print || clone(pr); fn(p); D.print = p; window.__lastUserPrint = clone(p); relook(); if (!live) buildPane('print'); };
    const patThumb = ([k, l]) => { const b = h('button', { type: 'button', class: 'thumb', title: t(l), 'aria-pressed': String(pr.pattern === k), on: { click: () => setPr(p => { p.pattern = k; p.imageId = null; p.size = p.size < 0.15 ? 0.28 : p.size; p.color = p.color || '#d4a63c'; }) } });
      const c = patternCanvas(k, D.parts.body.color, pr.color || '#d4a63c', 128); c.style.cssText = 'width:100%;height:100%;border-radius:8px'; b.appendChild(c); return b; };
    return [group(t('patterns'), [h('div', { class: 'gallery' }, PATTERNS.map(patThumb)),
        pr.pattern ? h('div', {}, [h('div', { class: 'hint', style: 'margin:10px 0 4px' }, [t('patColor')]), swatches(pr.color, v => setPr(p => { p.color = v; }), true)]) : null], t('printHelp')),
      group(t('orLogo'), mine.length ? [h('div', { class: 'gallery' }, mine.map(id => thumb(id, pr.imageId === id, () => setPr(p => { p.imageId = id; p.pattern = null; p.size = p.size > 0.2 ? 0.1 : p.size; }))))]
        : [h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: () => { current = 'logos'; buildTabs(); buildPane('logos'); } } }, [t('tLogos')])]),
      D.print && (D.print.imageId || D.print.pattern) ? group(t('printParts'), [h('div', { class: 'row' }, [['body', 'pBody'], ['sleeves', 'pSleeves'], ['pants', 'pPants'], ['collar', 'pCollar']].map(([k, l]) => {
        const c = h('input', { type: 'checkbox' }); c.checked = pr.parts.includes(k);
        c.addEventListener('change', () => setPr(p => { p.parts = c.checked ? [...new Set(p.parts.concat(k))] : p.parts.filter(x => x !== k); }));
        return h('label', { class: 'check' }, [c, t(l)]);
      })),
      slider(t('size'), 3, 60, 1, Math.round(pr.size * 100), v => v + ' cm', (v, live) => setPr(p => { p.size = v / 100; }, live)),
      pr.pattern ? null : slider(t('spacing'), 0, 25, 1, Math.round((pr.gap || 0.07) * 100), v => v + ' cm', (v, live) => setPr(p => { p.gap = v / 100; }, live)),
      slider(t('angle'), -45, 45, 1, pr.rotate || 0, v => v + '°', (v, live) => setPr(p => { p.rotate = v; }, live)),
      h('button', { type: 'button', class: 'btn btn--ghost btn--sm', style: 'margin-top:8px', on: { click: () => { D.print = null; relook(); buildPane('print'); } } }, [t('removePrint')])]) : null];
  },
  text() {
    const spec = Object.assign({ text: '', font: 'gothic', fill: '#f5f5f2', outline: '#111111' }, store.get('synq-traje3d-text') || {});
    const save = () => store.set('synq-traje3d-text', spec);
    const inp = h('input', { type: 'text', value: spec.text, maxlength: 28, placeholder: t('textPh') });
    inp.addEventListener('input', () => { spec.text = inp.value; save(); });
    const preview = h('div', { class: 'thumb', style: 'aspect-ratio:auto;height:90px;margin-top:10px' });
    const refresh = async () => { if (!spec.text.trim()) { preview.innerHTML = ''; return; } preview.innerHTML = ''; preview.appendChild(h('img', { src: await textImage(spec), alt: '' })); };
    inp.addEventListener('change', refresh);
    refresh();
    return [group(t('tText'), [h('div', { class: 'field' }, [inp]), preview], t('textHelp')),
      group(t('font'), [opts(FONTS.map(([k, l]) => [k, t(l)]), spec.font, v => { spec.font = v; save(); buildPane('text'); })]),
      group(t('fill'), [swatches(spec.fill, v => { spec.fill = v; save(); buildPane('text'); }, true)]),
      group(t('outline'), [opts([['none', t('nNone')], ['#111111', t('black')], ['#f5f5f2', lang === 'es' ? 'Blanca' : 'White'], ['#d4a63c', t('gold')], ['#c4121f', lang === 'es' ? 'Roja' : 'Red']], spec.outline, v => { spec.outline = v; save(); buildPane('text'); })]),
      h('button', { type: 'button', class: 'btn', on: { click: async () => {
        if (!spec.text.trim()) { inp.focus(); return; }
        const id = 't:' + b64.enc(JSON.stringify({ text: spec.text.trim(), font: spec.font, fill: spec.fill, outline: spec.outline }));
        IMG[id] = await loadImage(await textImage(spec)); startPlacing(id);
      } } }, [t('makeText')])];
  },
  band() {
    const cols = [['name', 'mName'], ['size', 'mSize'], ['chest', 'mChest'], ['waist', 'mWaist'], ['sleeve', 'mSleeve'], ['inseam', 'mInseam']];
    const table = h('table', { class: 'members' }, [h('thead', {}, [h('tr', {}, cols.map(([, l]) => h('th', {}, [t(l)])).concat([h('th', {})]))]),
      h('tbody', {}, D.members.map((m, i) => h('tr', {}, cols.map(([k, l]) => {
        const inp = h('input', { value: m[k] || '', inputmode: k === 'name' || k === 'size' ? 'text' : 'decimal', 'aria-label': t(l) });
        inp.addEventListener('input', () => { D.members[i][k] = inp.value; persist(); });
        return h('td', { style: k === 'name' ? 'min-width:110px' : 'min-width:58px' }, [inp]);
      }).concat([h('td', {}, [h('button', { type: 'button', class: 'del', 'aria-label': t('del'), on: { click: () => { D.members.splice(i, 1); persist(); buildPane('band'); } } }, ['×'])])]))))]);
    const notes = h('textarea', { rows: 4, placeholder: t('notesPh') }); notes.value = D.notes || '';
    notes.addEventListener('input', () => { D.notes = notes.value; persist(); });
    return [group(t('tBand'), [h('div', { class: 'scrollx' }, [table]), h('p', { class: 'hint', style: 'margin-top:8px' }, [t('units')]),
      h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: () => { D.members.push({ name: '', size: '', chest: '', waist: '', sleeve: '', inseam: '' }); persist(); buildPane('band'); } } }, [t('addMember')])], t('bandHelp')),
      group(t('notes'), [h('div', { class: 'field' }, [notes])])];
  },
};
function buildPane(k) {
  const y = panes.parentElement.scrollTop;
  panes.innerHTML = '';
  (PANES[k] || PANES.styles)().forEach(n => n && panes.appendChild(n));
  panes.parentElement.scrollTop = y;
}

// ---------- views ----------
document.querySelectorAll('.views [data-view]').forEach(b => b.addEventListener('click', () => { studio.setSpin(false); $('#btnSpin').setAttribute('aria-pressed', 'false'); studio.view(b.dataset.view); }));
$('#btnSpin').addEventListener('click', () => { studio.setSpin(!studio.spinning); $('#btnSpin').setAttribute('aria-pressed', String(studio.spinning)); });

// ---------- language ----------
function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-t]').forEach(e => { e.textContent = t(e.dataset.t); });
  document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  document.title = t('title') + ' | SYNQ Studios';
  buildTabs(); buildPane(current);
}
document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; try { localStorage.setItem('synq-lang', lang); } catch (e) {} applyLang(); }));

// ---------- name, toast, stats ----------
const nameEl = $('#designName');
nameEl.value = D.name;
nameEl.addEventListener('input', () => { D.name = nameEl.value; persist(); });
let tt;
function toast(msg) { const e = $('#toast'); e.textContent = msg; e.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => e.classList.remove('on'), 2600); }
function count(path, title) { try { window.goatcounter && window.goatcounter.count && window.goatcounter.count({ path, title, event: true }); } catch (e) {} }

// ---------- save / my designs ----------
$('#btnSave').addEventListener('click', () => {
  const list = store.get('synq-trajes3d') || [];
  const i = list.findIndex(x => x.d.name === D.name), item = { at: Date.now(), d: clone(D) };
  if (i >= 0) list[i] = item; else list.unshift(item);
  if (store.set('synq-trajes3d', list.slice(0, 20))) toast(t('saved')); else toast(t('tooBig'));
  count('trajes-save', 'Saved a suit design');
});
$('#btnMine').addEventListener('click', () => {
  const ul = $('#mineList'); ul.innerHTML = '';
  const list = store.get('synq-trajes3d') || [];
  if (!list.length) ul.appendChild(h('li', {}, [h('span', { class: 'muted' }, [t('noSaved')])]));
  list.forEach((x, i) => ul.appendChild(h('li', {}, [h('b', {}, [x.d.name || t('myDesign'), h('small', {}, [new Date(x.at).toLocaleString(lang === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })])]),
    h('button', { type: 'button', class: 'btn btn--sm', on: { click: () => { D = merge(BASE, x.d); nameEl.value = D.name; rebuild(); buildPane(current); $('#dlgMine').close(); } } }, [t('open')]),
    h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: e => { list.splice(i, 1); store.set('synq-trajes3d', list); e.target.closest('li').remove(); } } }, [t('del')])])));
  $('#dlgMine').showModal();
});

// ---------- image of the design (front + back) ----------
async function designImage() {
  const views = ['front', 'back'].map(v => studio.snapshot(v, 900, 1200));
  const imgs = await Promise.all(views.map(loadImage));
  const W = 1900, H = 1420, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(W / 2, 300, 100, W / 2, 500, 1200); g.addColorStop(0, '#4a3631'); g.addColorStop(0.5, '#241614'); g.addColorStop(1, '#0b0606');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  imgs.forEach((im, i) => x.drawImage(im, 40 + i * 920, 140, 900, 1200));
  x.fillStyle = '#fff4ec'; x.font = '400 60px Anton, Impact, sans-serif'; x.fillText((D.name || t('myDesign')).toUpperCase(), 50, 95);
  x.fillStyle = '#c9a89a'; x.font = '600 24px Inter, system-ui, sans-serif'; x.fillText(t('made'), 50, H - 30);
  return new Promise(r => c.toBlob(r, 'image/png'));
}
const fileName = () => (D.name || 'traje').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') + '.png';
$('#btnDownload').addEventListener('click', async () => {
  toast(t('downloading'));
  const blob = await designImage(), file = new File([blob], fileName(), { type: 'image/png' });
  count('trajes-download', 'Downloaded a suit image');
  if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer: coarse)').matches) { try { await navigator.share({ files: [file], title: D.name }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  const a = h('a', { href: URL.createObjectURL(blob), download: file.name }); document.body.appendChild(a); a.click(); a.remove();
});

// ---------- share ----------
function shareURL() { const lite = clone(D); delete lite.images; lite.decals = lite.decals.filter(dc => !dc.imageId.startsWith('u:')); if (lite.print && lite.print.imageId && lite.print.imageId.startsWith('u:')) lite.print = null; return location.origin + location.pathname + '#d=' + b64.enc(JSON.stringify(lite)); }
$('#btnShare').addEventListener('click', async () => {
  const url = shareURL(), hasUploads = Object.keys(D.images).length > 0;
  count('trajes-share', 'Shared a suit design');
  if (navigator.share) {
    try {
      const blob = await designImage(), file = new File([blob], fileName(), { type: 'image/png' });
      const data = { title: D.name, text: t('shareText') + ': ' + D.name + '\n' + url };
      if (navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
      await navigator.share(data); return;
    } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(url); toast(hasUploads ? t('linkNoUploads') : t('copied')); } catch (e) { prompt(t('share'), url); }
});

// ---------- tailor sheet ----------
$('#btnSheet').addEventListener('click', () => {
  const sh = $('#sheet');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sw = c => `<span class="chip" style="background:${c}"></span>${colorName(c)} <small>(${String(c).toUpperCase()})</small>`;
  const row = (a, b) => `<tr><th>${a}</th><td>${b}</td></tr>`;
  const lab = (list, v) => { const f = list.find(x => x[0] === v); return f ? t(f[1]) : v; };
  const shots = ['front', 'back', 'left', 'right'].map(v => studio.snapshot(v, 600, 800));
  const fabricRows = PARTS.map(([k, l]) => `<tr><td>${t(l)}</td><td>${lab(FABRICS, D.parts[k].fabric)}</td><td>${sw(D.parts[k].color)}</td></tr>`).join('');
  const decalRows = D.decals.map(dc => `<tr><td style="width:70px">${IMG[dc.imageId] ? `<img src="${IMG[dc.imageId].src}" style="max-width:64px;max-height:48px">` : ''}</td><td>${esc(where(dc))}</td><td>${Math.round(dc.size * 100)} cm (${(dc.size * 39.37).toFixed(1)} in) ${t('approx')}</td><td>${lab(TECHS, dc.tech)}${dc.tech === 'patch' ? ' · ' + sw(dc.patchColor) : ''}</td></tr>`).join('');
  const members = D.members.filter(m => Object.values(m).some(Boolean));
  sh.innerHTML = `
    <h1>${esc(D.name || t('myDesign'))}</h1>
    <div>${t('sheetTitle')} · ${new Date().toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · SYNQ Studios</div>
    <div class="views4">${shots.map(s => `<img src="${s}">`).join('')}</div>
    <div class="cols">
      <div><h2>${t('tCut')}</h2><table>
        ${row(t('jacket'), lab([['blazer', 'sBlazer'], ['bomber', 'sBomber'], ['varsity', 'sVarsity'], ['western', 'sWestern']], D.style))}
        ${D.style === 'blazer' ? row(t('lapel'), lab([['notch', 'lNotch'], ['peak', 'lPeak'], ['shawl', 'lShawl']], D.lapel)) + row(t('buttons'), D.buttons) + row(t('neck'), lab([['bow', 'nBow'], ['tie', 'nTie'], ['none', 'nNone']], D.neckwear)) : ''}
        ${D.style === 'western' ? row(t('yoke'), D.yoke ? t('yes') : t('no')) : ''}
        ${row(t('hardware'), lab([['gold', 'gold'], ['silver', 'silver'], ['black', 'black']], D.hardware))}
        ${row(t('stripes'), lab([['none', 'none'], ['one', 'one'], ['two', 'two']], D.stripes))}${row(t('panels'), [['shoulders', 'panShoulders'], ['sides', 'panSides'], ['legs', 'panLegs']].filter(([k2]) => D.panels[k2]).map(([, l]) => t(l)).join(', ') || t('no'))}${row(t('piping'), D.piping.on ? [['sides', 'pipSides'], ['racing', 'pipRacing'], ['lapels', 'pipLapels'], ['front', 'pipFront'], ['sleeves', 'pipSleeves'], ['cuffs', 'pipCuffs'], ['pants', 'pipPants']].filter(([k2]) => D.piping[k2]).map(([, l]) => t(l)).join(', ') + ' · ' + (D.piping.size * 2000).toFixed(1) + ' mm' : t('no'))}${row(t('sleeveStripes'), D.sleeveStripes ? t('yes') : t('no'))}${row(t('hat'), D.hat ? t('yes') : t('no'))}</table></div>
      <div><h2>${t('tFabric')}</h2><table><tr><th>${t('part')}</th><th>${t('fabric')}</th><th>${t('color')}</th></tr>${fabricRows}</table></div>
    </div>
    ${D.decals.length ? `<h2>${t('tLogos')}</h2><table><tr><th></th><th>${t('placement')}</th><th>${t('size')}</th><th>${t('technique')}</th></tr>${decalRows}</table>` : ''}
    <h2>${t('tStonesTab')}</h2><table>${row(t('gemColor'), lab(GEMS, D.stones.color) + ' · ' + ((D.stones.size || 0.0032) * 2000).toFixed(1) + ' mm')}${row(t('edges'), [['lapels', 'eLapels'], ['front', 'eFront'], ['cuffs', 'eCuffs'], ['pockets', 'ePockets'], ['stripes', 'eStripes'], ['hem', 'eHem']].filter(([k]) => D.stones.edges[k]).map(([, l]) => t(l)).join(', ') || t('no'))}${row(t('scatter'), [['body', 'sBody'], ['sleeves', 'sSleeves'], ['pants', 'sPants']].filter(([k]) => D.stones.scatter[k] > 0).map(([k, l]) => t(l) + ' ' + D.stones.scatter[k] + '%').join(', ') || t('no'))}</table>
    ${D.print && (D.print.imageId || D.print.pattern) ? `<h2>${t('tPrint')}</h2><table>${row(t('printImage'), D.print.pattern ? lab(PATTERNS, D.print.pattern) + ' · ' + sw(D.print.color) : IMG[D.print.imageId] ? `<img src="${IMG[D.print.imageId].src}" style="max-height:40px">` : '')}${row(t('printParts'), D.print.parts.map(p => lab(PARTS, p)).join(', '))}${row(t('size'), Math.round(D.print.size * 100) + ' cm')}${D.print.pattern ? '' : row(t('spacing'), Math.round((D.print.gap || 0) * 100) + ' cm')}${row(t('angle'), (D.print.rotate || 0) + '°')}</table>` : ''}
    ${members.length ? `<h2>${t('members')}</h2><table><tr><th>${t('mName')}</th><th>${t('mSize')}</th><th>${t('mChest')}</th><th>${t('mWaist')}</th><th>${t('mSleeve')}</th><th>${t('mInseam')}</th></tr>
      ${members.map(m => `<tr><td>${esc(m.name)}</td><td>${esc(m.size)}</td><td>${esc(m.chest)}</td><td>${esc(m.waist)}</td><td>${esc(m.sleeve)}</td><td>${esc(m.inseam)}</td></tr>`).join('')}</table><div>${t('units')}</div>` : ''}
    ${D.notes ? `<h2>${t('notes')}</h2><div>${esc(D.notes).replace(/\n/g, '<br>')}</div>` : ''}`;
  count('trajes-sheet', 'Printed a tailor sheet');
  setTimeout(() => window.print(), 80);
});

// ---------- phone: bottom sheet you can slide up and down ----------
(function sheet() {
  const mq = matchMedia('(max-width: 900px)'), panel = document.querySelector('.panel'), handle = document.getElementById('sheetHandle'), root = document.documentElement;
  const SIZES = () => { const vh = innerHeight, bar = 54, mb = 64; return { peek: 96, half: Math.round(vh * 0.46), full: Math.round(vh - bar - mb - 110) }; };
  let state = store.get('synq-sheet') || 'half';
  const apply = (px) => root.style.setProperty('--sheet', px + 'px');
  const set = st => { state = st; store.set('synq-sheet', st); root.dataset.sheet = st; apply(SIZES()[st]); };
  window.__sheetOpen = () => { if (mq.matches && state === 'peek') set('half'); };
  window.__sheetRestore = () => { if (mq.matches) set(state); };
  if (mq.matches) set(state);
  mq.addEventListener('change', () => { if (mq.matches) set(state); else root.style.removeProperty('--sheet'); });
  addEventListener('resize', () => { if (mq.matches) set(state); });
  let start = null;
  handle.addEventListener('pointerdown', e => { start = { y: e.clientY, h: panel.getBoundingClientRect().height, moved: false }; handle.setPointerCapture(e.pointerId); panel.classList.add('dragging'); document.body.classList.add('sheet-drag'); });
  handle.addEventListener('pointermove', e => { if (!start) return; const dy = start.y - e.clientY; if (Math.abs(dy) > 4) start.moved = true; const S = SIZES(); apply(Math.max(S.peek, Math.min(S.full, start.h + dy))); });
  const end = e => {
    if (!start) return; panel.classList.remove('dragging'); document.body.classList.remove('sheet-drag');
    const S = SIZES(), h = panel.getBoundingClientRect().height;
    if (!start.moved) set(state === 'peek' ? 'half' : state === 'half' ? 'full' : 'peek');
    else set(['peek', 'half', 'full'].reduce((a, b) => Math.abs(S[b] - h) < Math.abs(S[a] - h) ? b : a));
    start = null;
  };
  handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
})();

// ---------- phone action bar ----------
document.querySelectorAll('.mobilebar [data-act]').forEach(b => b.addEventListener('click', () => document.getElementById(b.dataset.act).click()));

// ---------- go ----------
applyLang();
rebuild().then(() => { $('#loading').hidden = true; studio.view('three', true); window.__trajesReady = true; });
