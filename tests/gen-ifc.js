/* مولّد IFC4 حقيقي: برج متعدد الأدوار (بلاطات + أعمدة + جدران + واجهة زجاجية).
   يُنتج ملف STEP صالحاً يعرضه web-ifc كمبنى فعلي بعشرات العناصر — لا مجرد صندوق. */
const fs = require('fs');
const path=require('path');
const out = process.argv[2] || path.join(__dirname,'..','public','vendor','bim','BassirTower.ifc');

let id = 0; const L = []; const ref = n => '#' + n;
function put(s){ id++; L.push('#' + id + '=' + s); return id; }
function guid(){ // 22-char IFC base64 guid (pseudo)
  const c='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
  let s=''; for(let i=0;i<22;i++) s+=c[Math.floor(Math.random()*64)]; return s;
}
const G = () => "'" + guid() + "'";

// ---- header entities ----
const person = put("IFCPERSON($,'Bassir','Owner-Eyes',$,$,$,$,$)");
const org = put("IFCORGANIZATION($,'Bassir','Owner Eyes Platform',$,$)");
const pando = put(`IFCPERSONANDORGANIZATION(${ref(person)},${ref(org)},$)`);
const app = put(`IFCAPPLICATION(${ref(org)},'1.0','Bassir IFC Generator','bassir-ifc')`);
const owner = put(`IFCOWNERHISTORY(${ref(pando)},${ref(app)},$,.ADDED.,$,${ref(pando)},${ref(app)},${Math.floor(Date.now()/1000)})`);

// ---- units ----
const lenUnit = put("IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)");
const areaUnit = put("IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)");
const volUnit = put("IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)");
const angUnit = put("IFCSIUNIT(*,.PLANEANGLEUNIT.,.MILLI.,.RADIAN.)");
const unitAsg = put(`IFCUNITASSIGNMENT((${ref(lenUnit)},${ref(areaUnit)},${ref(volUnit)},${ref(angUnit)}))`);

// ---- geometric context ----
const origin = put("IFCCARTESIANPOINT((0.,0.,0.))");
const dirZ = put("IFCDIRECTION((0.,0.,1.))");
const dirX = put("IFCDIRECTION((1.,0.,0.))");
const axis = put(`IFCAXIS2PLACEMENT3D(${ref(origin)},${ref(dirZ)},${ref(dirX)})`);
const ctx = put(`IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-5,${ref(axis)},$)`);

// ---- surface styles (colours) ----
function style(name, r, g, b, transparency){
  const col = put(`IFCCOLOURRGB('${name}',${r},${g},${b})`);
  const rend = put(`IFCSURFACESTYLERENDERING(${ref(col)},${transparency||0.},$,$,$,$,$,$,.FLAT.)`);
  const ss = put(`IFCSURFACESTYLE('${name}',.BOTH.,(${ref(rend)}))`);
  return ss;
}
const stConcrete = style('Concrete', 0.72, 0.72, 0.74, 0.);
const stColumn   = style('Column',   0.55, 0.57, 0.62, 0.);
const stGlass    = style('Glass',    0.32, 0.55, 0.85, 0.45);
const stMullion  = style('Mullion',  0.20, 0.22, 0.26, 0.);
const stCore     = style('Core',     0.66, 0.60, 0.42, 0.);

// helper: styled extruded box -> returns product-definition-shape id + placement id
function boxShape(xdim, ydim, depth, styleId){
  const p2 = put(`IFCCARTESIANPOINT((0.,0.))`);
  const a2 = put(`IFCAXIS2PLACEMENT2D(${ref(p2)},$)`);
  const prof = put(`IFCRECTANGLEPROFILEDEF(.AREA.,$,${ref(a2)},${xdim},${ydim})`);
  const pOrigin = put(`IFCCARTESIANPOINT((0.,0.,0.))`);
  const solidAxis = put(`IFCAXIS2PLACEMENT3D(${ref(pOrigin)},${ref(dirZ)},${ref(dirX)})`);
  const extr = put(`IFCEXTRUDEDAREASOLID(${ref(prof)},${ref(solidAxis)},${ref(dirZ)},${depth})`);
  // apply style
  put(`IFCSTYLEDITEM(${ref(extr)},(${ref(styleId)}),$)`);
  const rep = put(`IFCSHAPEREPRESENTATION(${ref(ctx)},'Body','SweptSolid',(${ref(extr)}))`);
  const pds = put(`IFCPRODUCTDEFINITIONSHAPE($,$,(${ref(rep)}))`);
  return pds;
}
function placement(x, y, z, parent){
  const p = put(`IFCCARTESIANPOINT((${x},${y},${z}))`);
  const a = put(`IFCAXIS2PLACEMENT3D(${ref(p)},$,$)`);
  return put(`IFCLOCALPLACEMENT(${parent?ref(parent):'$'},${ref(a)})`);
}

// ---- spatial structure ----
const sitePl = placement(0,0,0,null);
const site = put(`IFCSITE(${G()},${ref(owner)},'Site',$,$,${ref(sitePl)},$,$,.ELEMENT.,$,$,$,$,$)`);
const bldgPl = placement(0,0,0,sitePl);
const bldg = put(`IFCBUILDING(${G()},${ref(owner)},'Bassir Commercial Tower',$,$,${ref(bldgPl)},$,$,.ELEMENT.,$,$,$)`);

// building dimensions
const W = 30, D = 20, FH = 4.0, FLOORS = 8, SLAB = 0.3;
const colSize = 0.6, wallT = 0.3;
const colsX = [ -W/2+1, -W/6, W/6, W/2-1 ];  // 4 columns across
const colsY = [ -D/2+1, 0, D/2-1 ];          // 3 columns deep

const storeys = [];
const contained = []; // {storey, elems:[]}
let elemCount = 0;

for (let f = 0; f < FLOORS; f++){
  const z = f * FH;
  const stPl = placement(0,0,z,bldgPl);
  const st = put(`IFCBUILDINGSTOREY(${G()},${ref(owner)},'Floor ${f+1}',$,$,${ref(stPl)},$,$,.ELEMENT.,${z})`);
  storeys.push(st);
  const elems = [];

  // slab (floor plate)
  const slabShape = boxShape(W, D, SLAB, stConcrete);
  const slabPl = placement(0,0,z,stPl);
  elems.push(put(`IFCSLAB(${G()},${ref(owner)},'Slab L${f+1}',$,$,${ref(slabPl)},${ref(slabShape)},$,.FLOOR.)`)); elemCount++;

  // columns
  colsX.forEach(cx => colsY.forEach(cy => {
    const cShape = boxShape(colSize, colSize, FH-SLAB, stColumn);
    const cPl = placement(cx, cy, z+SLAB, stPl);
    elems.push(put(`IFCCOLUMN(${G()},${ref(owner)},'Col L${f+1}',$,$,${ref(cPl)},${ref(cShape)},$,$)`)); elemCount++;
  }));

  // core walls (service core in middle)
  const coreShapeA = boxShape(6, wallT, FH-SLAB, stCore);
  elems.push(put(`IFCWALL(${G()},${ref(owner)},'Core L${f+1}',$,$,${ref(placement(0, -2, z+SLAB, stPl))},${ref(coreShapeA)},$,$)`)); elemCount++;
  const coreShapeB = boxShape(wallT, 4, FH-SLAB, stCore);
  elems.push(put(`IFCWALL(${G()},${ref(owner)},'Core L${f+1}',$,$,${ref(placement(-3, 0, z+SLAB, stPl))},${ref(coreShapeB)},$,$)`)); elemCount++;

  // back + side walls (concrete)
  const backWall = boxShape(W, wallT, FH-SLAB, stConcrete);
  elems.push(put(`IFCWALL(${G()},${ref(owner)},'Back L${f+1}',$,$,${ref(placement(0, D/2-wallT/2, z+SLAB, stPl))},${ref(backWall)},$,$)`)); elemCount++;
  const sideWallL = boxShape(wallT, D, FH-SLAB, stConcrete);
  elems.push(put(`IFCWALL(${G()},${ref(owner)},'Side L${f+1}',$,$,${ref(placement(-W/2+wallT/2, 0, z+SLAB, stPl))},${ref(sideWallL)},$,$)`)); elemCount++;
  const sideWallR = boxShape(wallT, D, FH-SLAB, stConcrete);
  elems.push(put(`IFCWALL(${G()},${ref(owner)},'Side L${f+1}',$,$,${ref(placement(W/2-wallT/2, 0, z+SLAB, stPl))},${ref(sideWallR)},$,$)`)); elemCount++;

  // GLAZED FACADE on the front (y = -D/2): window panels + mullions across the width
  const bays = 6, glassH = FH-SLAB-0.4, bayW = (W-1) / bays;
  for (let bcol = 0; bcol < bays; bcol++){
    const gx = -W/2 + 0.5 + bayW*(bcol+0.5);
    const glass = boxShape(bayW-0.15, 0.08, glassH, stGlass);
    elems.push(put(`IFCWINDOW(${G()},${ref(owner)},'Glazing L${f+1}',$,$,${ref(placement(gx, -D/2+0.1, z+SLAB+0.2, stPl))},${ref(glass)},$,$,$)`)); elemCount++;
    // vertical mullion
    const mul = boxShape(0.12, 0.15, FH-SLAB, stMullion);
    elems.push(put(`IFCPLATE(${G()},${ref(owner)},'Mullion L${f+1}',$,$,${ref(placement(-W/2+0.5+bayW*bcol, -D/2+0.1, z+SLAB, stPl))},${ref(mul)},$,$)`)); elemCount++;
  }
  // spandrel band under glazing
  const spandrel = boxShape(W-1, 0.15, 0.4, stConcrete);
  elems.push(put(`IFCPLATE(${G()},${ref(owner)},'Spandrel L${f+1}',$,$,${ref(placement(0, -D/2+0.1, z+SLAB, stPl))},${ref(spandrel)},$,$)`)); elemCount++;

  contained.push({ st, elems });
}

// ---- project (must reference context) ----
const proj = put(`IFCPROJECT(${G()},${ref(owner)},'Bassir Tower Project',$,$,$,$,(${ref(ctx)}),${ref(unitAsg)})`);

// ---- aggregation relationships ----
put(`IFCRELAGGREGATES(${G()},${ref(owner)},$,$,${ref(proj)},(${ref(site)}))`);
put(`IFCRELAGGREGATES(${G()},${ref(owner)},$,$,${ref(site)},(${ref(bldg)}))`);
put(`IFCRELAGGREGATES(${G()},${ref(owner)},$,$,${ref(bldg)},(${storeys.map(ref).join(',')}))`);
contained.forEach(c => {
  put(`IFCRELCONTAINEDINSPATIALSTRUCTURE(${G()},${ref(owner)},$,$,(${c.elems.map(ref).join(',')}),${ref(c.st)})`);
});

// ---- assemble STEP file ----
const now = new Date().toISOString();
const header =
`ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');
FILE_NAME('${out.split('/').pop()}','${now}',('Bassir'),('Bassir Owner Eyes'),'Bassir IFC Generator','Bassir','');
FILE_SCHEMA(('IFC4'));
ENDSEC;
DATA;
${L.join(';\n')};
ENDSEC;
END-ISO-10303-21;
`;
fs.writeFileSync(out, header);
console.log('wrote', out, fs.statSync(out).size, 'bytes; entities:', id, 'elements:', elemCount, 'storeys:', FLOORS);
