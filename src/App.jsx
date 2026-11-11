import { useState } from 'react'
import './App.css'

const BASE_URL = "https://api.fda.gov/drug/label.json"
const LIMIT = 20;

const SECTIONS = [
  {key:"purpose", label:"Purpose"},
  {key:"indication", label:"Indications"},
  {key:"dosage", label:"dosages"},
  {key:"warning", label:"warning"}
];

const first = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : "")
const joinText = (arr) => (Array.isArray(arr) ? arr.join("\n\n"):"");

const titleCase = (s) => s;

function normalizeLabel(raw){
  const o = raw.openfda ?? {};
  const type = first(o.product_type);
  return {
    id: raw.id,
    brandName: titleCase(first(o.brand_name)) || "Unknown",
    genericName : titleCase(first(o.generic_name)) || "Unknown",
    manufacturer: first(o.manufacturer_name) || "N/A",
    productType: type === "HUMAN OTC DRUG" ? "OTC" : type === "HUMAN PRESCRIPTION DRUG" ? "Prescription": titleCase(type) || "N/A",
    purpose: joinText(raw.purpose),
    indications: joinText(raw.indications_and_usage),
    dosage: joinText(raw.dosage_and_administration),
    warnings: joinText(raw.warnings),
  }
}
const styles = [

]
async function fetchLabels(search){
  const url = `${BASE_URL}?search=${encodeURIComponent(search)}&limit=${LIMIT}`;
  const res = await fetch(url);
  if(res.status === 404) return {results: [], total:0};
  if (!res.ok) throw new Error (`Request Failed (${res.status})`);
  const data = await res.json();
  const results = (data.results ?? []).map(normalizeLabel);
  console.log(results)
  return {results, total: data.meta?.results.total ?? results.length}

}

function Searchbar({value, onChange, onSubmit}){
  return (
    <form style = {styles.form} onSubmit={onSubmit}>
      <input
      style={styles.input}
      value = {value}
      onChange={(e) => onChange(e.target.value)}
      placeholder='Search meds'/>
      <button style={styles.button}>Search</button> 
      </form>
  )
}

function MedicineCard ({medicine, onSelect}){
  console.log("hi");
  return (
    <div onClick={() => onSelect(medicine)}>
      <p >{medicine.brandName}</p>
      <p >{medicine.genericName}</p>
      <p >{medicine.manufacturer}</p>
      <p >{medicine.productType}</p>
      <p >{medicine.route}</p>
    </div>
  )
}

function DetailPage({medicine, onBack}){
  return(
    <div>
      <button style={styles.back} onClick={onBack}>Back to results</button>
      <h2 style={styles.title}>{medicine.brandName} </h2>
      <p style={styles.row}><b>Generic Name: </b>{medicine.genericName} </p>
      <p style={styles.row}><b>Manufacturer: </b>{medicine.manufacturer} </p>
      <p style={styles.row}><b>Product type: </b>{medicine.productType} </p>
      <p style={styles.row}><b>Route: </b>{medicine.route} </p>
    </div>
  )
}

function App() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle")
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState("")
  const [searchedTerm, setSearchedTerm] = useState("")
  const [selected, setSelected] = useState(null)
  const handleSearch = async(e) => {
    e.preventDefault();
    const term = query.trim();
    if(!term) return;
    setStatus("loading");
    setError("");
    setSearchedTerm(term)
    try {
      const data = await fetchLabels(`openfda.brand_name:"${term}"`);
      setResults(data)
      setTotal(data.total)
      setStatus("success")
    } catch (err){
      setError(err.message);
      setStatus("error")
    }
  }
  if (selected){
    <div>
      <DetailPage medicine={selected} onBack={() => setSelected(null)}/>
    </div>
  }

    return (
      <div >
        <h1 >Search Medicine</h1>
        <Searchbar value = {query} onChange={setQuery} onSubmit={handleSearch}/>
        {status === "idle" && <div > Search..</div> }
        {status === "loading" && <div > loading....</div> }
        {status === "error" && <div > {error}</div> }
        {status === "success" && results.length === 0 && (<div >No results found </div>)}
        {status === "success" && results.length > 0 && <p> Showing {results.length}{total > results.length ? `of ${total}`:""}</p>}
        <div>
          {[{
    "meta": {
        "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
        "terms": "https://open.fda.gov/terms/",
        "license": "https://open.fda.gov/license/",
        "last_updated": "2026-11-11",
        "results": {
            "skip": 0,
            "limit": 20,
            "total": 39
        }
    },
    "results": [
        {
            "spl_product_data_elements": [
                "Advil Dual Action with Acetaminophen ibuprofen, acetaminophen tablet, film coated FERRIC OXIDE RED IBUPROFEN IBUPROFEN ACETAMINOPHEN ACETAMINOPHEN HYPROMELLOSE, UNSPECIFIED POLYETHYLENE GLYCOL, UNSPECIFIED TITANIUM DIOXIDE POLYDEXTROSE CARNAUBA WAX GLYCERYL DIBEHENATE SILICON DIOXIDE CROSCARMELLOSE SODIUM STARCH, CORN Advil;II Advil Dual Action with Acetaminophen, Travel BASIX ibuprofen, acetaminophen tablet, film coated FERRIC OXIDE RED IBUPROFEN IBUPROFEN ACETAMINOPHEN ACETAMINOPHEN HYPROMELLOSE, UNSPECIFIED POLYETHYLENE GLYCOL, UNSPECIFIED TITANIUM DIOXIDE POLYDEXTROSE CARNAUBA WAX GLYCERYL DIBEHENATE SILICON DIOXIDE CROSCARMELLOSE SODIUM STARCH, CORN Advil;II"
            ],
            "spl_unclassified_section": [
                "Drug Facts ​Drug Facts",
                "Other information ​Other information read all warnings and directions before use. Keep carton. store at 20-25°C (68-77°F) avoid excessive heat above 40°C (104°F)",
                "Questions or comments? Questions or comments? call weekdays 9 AM to 5 PM at 1-800-88-ADVIL"
            ],
            "active_ingredient": [
                "Active ingredients ​Active ingredients Acetaminophen 250 mg Ibuprofen 125 mg (NSAID*) *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purposes Purposes Pain reliever Pain reliever"
            ],
            "indications_and_usage": [
                "Uses ​Uses temporarily relieves minor aches and pains due to: headache toothache backache menstrual cramps muscular aches minor pain of arthritis"
            ],
            "warnings": [
                "Warnings ​Warnings Acetaminophen liver damage warning Acetaminophen liver damage warning: This product contains acetaminophen. Severe liver damage may occur if you take: with other drugs containing acetaminophen more than 6 caplets in 24 hours, which is the maximum daily amount for this product 3 or more alcoholic drinks every day while using this product Acetaminophen allergy alert Acetaminophen allergy alert: may cause severe skin reactions. Symptoms may include: skin reddening blisters rash If skin reaction occurs, stop use and seek medical help right away. NSAID allergy alert NSAID allergy alert: ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. NSAID stomach bleeding warning NSAID stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you: are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attackand stroke warning Heart attackand stroke warning: NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use ​Do not use with any other drug containing acetaminophen (prescription or nonprescription). If you are not sure whether a drug contains acetaminophen, ask a doctor or pharmacist if you have ever had an allergic reaction to acetaminophen or any other pain reliever right before or after heart surgery Ask a doctor before use if Ask a doctor before use if you have liver disease stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic Ask a doctor or pharmacist before use if you are Ask a doctor or pharmacist before use if you are under a doctor’s care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product When using this product take with food or milk if stomach upset occurs Stop use and ask a doctor if Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days redness or swelling is present in the painful area any new symptoms appear If pregnant or breast-feeding If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away. Prompt medical attention is critical for adults as well as for children even if you do not notice any signs or symptoms."
            ],
            "do_not_use": [
                "Do not use ​Do not use with any other drug containing acetaminophen (prescription or nonprescription). If you are not sure whether a drug contains acetaminophen, ask a doctor or pharmacist if you have ever had an allergic reaction to acetaminophen or any other pain reliever right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if Ask a doctor before use if you have liver disease stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are Ask a doctor or pharmacist before use if you are under a doctor’s care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product When using this product take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days redness or swelling is present in the painful area any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away. Prompt medical attention is critical for adults as well as for children even if you do not notice any signs or symptoms."
            ],
            "dosage_and_administration": [
                "Directions ​Directions Do not take more than directed adults and children 12 years and over take 2 caplets every 8 hours while symptoms persist children under 12 years ask a doctor do not take more than 6 caplets in 24 hours, unless directed by a doctor"
            ],
            "dosage_and_administration_table": [
                "<table border=\"0\" width=\"100%\"><tbody><tr><td>adults and children 12 years and over</td><td><list listType=\"unordered\" styleCode=\"Square\"><item><content styleCode=\"bold\">take 2 caplets every 8 hours</content> while symptoms persist </item></list></td></tr><tr><td>children under 12 years</td><td><list listType=\"unordered\" styleCode=\"Square\"><item>ask a doctor</item></list></td></tr></tbody></table>"
            ],
            "inactive_ingredient": [
                "Inactive ingredients ​Inactive ingredients carnauba wax, colloidal silicon dioxide, croscarmellose sodium, ferric oxides, glyceryl dibehenate, hypromellose, pharmaceutical ink, polydextrose, polyethylene glycol, pregelatinized starch, titanium dioxide"
            ],
            "recent_major_changes": [
                ""
            ],
            "package_label_principal_display_panel": [
                "Advil Dual Action with Acetaminophen, Lil' Drug Store Advil Dual Action with Acetaminophen [caplet image] Acetaminophen 250 mg and Ibuprofen (NSAID) 125 mg Tablets Pain Reliever 6 Caplets* *Capsule-Shaped Tablets [Lil' Drug Store logo] PDP/Package",
                "Advil Dual Action with Acetaminophen, Travel BASIX Advil Dual Action with Acetaminophen [caplet image] Acetaminophen 250 mg and Ibuprofen (NSAID) 125 mg Tablets Pain Reliever 4 Caplets* *Capsule-Shaped Tablets [Travel BASIX logo] PDP/Package"
            ],
            "set_id": "030d9bca-a934-6ef9-e063-6394a90a8277",
            "id": "44e71018-211d-caf8-e063-6394a90a06c9",
            "effective_time": "20251201",
            "version": "4",
            "openfda": {
                "application_number": [
                    "NDA211733"
                ],
                "brand_name": [
                    "Advil Dual Action with Acetaminophen, Travel BASIX",
                    "Advil Dual Action with Acetaminophen"
                ],
                "generic_name": [
                    "IBUPROFEN, ACETAMINOPHEN TABLET, FILM COATED"
                ],
                "manufacturer_name": [
                    "Lil' Drug Store Products, Inc."
                ],
                "product_ndc": [
                    "66715-6401",
                    "66715-9601"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN",
                    "ACETAMINOPHEN"
                ],
                "rxcui": [
                    "2387532"
                ],
                "spl_id": [
                    "44e71018-211d-caf8-e063-6394a90a06c9"
                ],
                "spl_set_id": [
                    "030d9bca-a934-6ef9-e063-6394a90a8277"
                ],
                "package_ndc": [
                    "66715-9601-3",
                    "66715-9601-2",
                    "66715-6401-2"
                ],
                "is_original_packager": [
                    true
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "362O9ITL9D",
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "JUNIOR STRENGTH ADVIL ibuprofen IBUPROFEN IBUPROFEN ASPARTAME CELLACEFATE SILICON DIOXIDE D&C RED NO. 30 FD&C BLUE NO. 2 GELATIN, UNSPECIFIED MAGNESIUM STEARATE MANNITOL MICROCRYSTALLINE CELLULOSE SODIUM STARCH GLYCOLATE TYPE A POTATO light purple mottled round purple tablet Advil;100"
            ],
            "active_ingredient": [
                "ACTIVE INGREDIENT (IN EACH TABLET) Ibuprofen 100 mg (NSAID)* *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "PURPOSE Fever reducer/Pain reliever"
            ],
            "indications_and_usage": [
                "USES temporarily: • reduces fever • relieves minor aches and pains due to the common cold, flu, sore throat, headaches and toothaches"
            ],
            "warnings": [
                "WARNINGS Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: • hives • facial swelling • asthma (wheezing) • shock • skin reddening • rash • blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if the child • has had stomach ulcers or bleeding problems • takes a blood thinning (anticoagulant) or steroid drug • takes other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] • takes more or for a longer time than directed Heart attack and stroke warning NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Sore throat warning: Severe or persistent sore throat or sore throat accompanied by high fever, headache, nausea, and vomiting may be serious. Consult doctor promptly. Do not use more than 2 days or administer to children under 3 years of age unless directed by doctor. Do not use • if the child has ever had an allergic reaction to any other pain reliever/fever reducer • right before or after heart surgery Ask a doctor before use if • stomach bleeding warning applies to the child • child has problems or serious side effects from taking pain relievers or fever reducers • child has a history of stomach problems, such as heartburn • child has high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke • child has not been drinking fluids • child has lost a lot of fluid due to vomiting or diarrhea • child is taking a diuretic Ask a doctor or pharmacist before use if the child is • under a doctor's care for any serious condition • taking any other drug When using this product • take with food or milk if stomach upset occurs Stop use and ask a doctor if • child experiences any of the following signs of stomach bleeding: • feels faint • vomits blood • has bloody or black stools • has stomach pain that does not get better • child has symptoms of heart problems or stroke: • chest pain • trouble breathing • weakness in one part or side of body • slurred speech • leg swelling • child does not get any relief within first day (24 hours) of treatment • fever or pain gets worse or lasts more than 3 days • redness or swelling is present in the painful area • any new symptoms appear Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use • if the child has ever had an allergic reaction to any other pain reliever/fever reducer • right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if • stomach bleeding warning applies to the child • child has problems or serious side effects from taking pain relievers or fever reducers • child has a history of stomach problems, such as heartburn • child has high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke • child has not been drinking fluids • child has lost a lot of fluid due to vomiting or diarrhea • child is taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if the child is • under a doctor's care for any serious condition • taking any other drug"
            ],
            "when_using": [
                "When using this product • take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if • child experiences any of the following signs of stomach bleeding: • feels faint • vomits blood • has bloody or black stools • has stomach pain that does not get better • child has symptoms of heart problems or stroke: • chest pain • trouble breathing • weakness in one part or side of body • slurred speech • leg swelling • child does not get any relief within first day (24 hours) of treatment • fever or pain gets worse or lasts more than 3 days • redness or swelling is present in the painful area • any new symptoms appear"
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "DIRECTIONS • this product does not contain directions or complete warnings for adult use • do not give more than directed • find right dose on chart. If possible, use weight to dose; otherwise use age. • repeat dose every 6-8 hours , if needed • do not use more than 4 times a day Dosing Chart Weight (lb) Age (yr) Dose (tablets) under 24 lb under 2 yr ask a doctor 24-35 lb 2-3 yr 1 tablet 36-47 lb 4-5 yr 1 ½ tablets 48-59 lb 6-8 yr 2 tablets 60-71 lb 9-10 yr 2 ½ tablets 72-95 lb 11 yr 3 tablets"
            ],
            "dosage_and_administration_table": [
                "<table ID=\"_Reftable1\" width=\"60%\"><caption>Dosing Chart</caption><col width=\"20%\"/><col width=\"19%\"/><col width=\"21%\"/><thead><tr><th align=\"left\" styleCode=\"Rrule Botrule Lrule Toprule \" valign=\"top\"><content styleCode=\"bold\">Weight (lb)</content></th><th align=\"left\" styleCode=\"Rrule Botrule Toprule \" valign=\"top\"><content styleCode=\"bold\">Age (yr)</content></th><th align=\"left\" styleCode=\"Rrule Botrule Toprule \" valign=\"top\"><content styleCode=\"bold\">Dose (tablets)</content></th></tr></thead><tbody><tr><td styleCode=\"Rrule Lrule Toprule Botrule \" valign=\"top\"><paragraph>under 24 lb</paragraph></td><td styleCode=\"Rrule Toprule Botrule \" valign=\"top\"><paragraph>under 2 yr</paragraph></td><td styleCode=\"Rrule Toprule Botrule \" valign=\"top\"><paragraph>ask a doctor</paragraph></td></tr><tr><td styleCode=\"Rrule Lrule Botrule \" valign=\"top\"><paragraph>24-35 lb</paragraph></td><td styleCode=\"Rrule Botrule \" valign=\"top\"><paragraph>2-3 yr</paragraph></td><td styleCode=\"Rrule Botrule \" valign=\"top\"><paragraph>1 tablet</paragraph></td></tr><tr><td styleCode=\"Rrule Lrule Botrule \" valign=\"top\"><paragraph>36-47 lb</paragraph></td><td styleCode=\"Rrule Botrule \" valign=\"top\"><paragraph>4-5 yr</paragraph></td><td styleCode=\"Rrule Botrule \" valign=\"top\"><paragraph>1 &#xBD; tablets</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Rrule Lrule Botrule \" valign=\"middle\"><paragraph>48-59 lb</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>6-8 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>2 tablets</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Rrule Lrule Botrule \" valign=\"middle\"><paragraph>60-71 lb</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>9-10 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>2 &#xBD; tablets</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Rrule Botrule Lrule \" valign=\"middle\"><paragraph>72-95 lb</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>11 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>3 tablets</paragraph></td></tr></tbody></table>"
            ],
            "spl_unclassified_section": [
                "OTHER INFORMATION • Phenylketonurics : contains phenylalanine 4.2 mg per tablet • one dose lasts 6-8 hours • store at 20-25°C (68-77°F) • see side of box for lot number and expiration date"
            ],
            "inactive_ingredient": [
                "INACTIVE INGREDIENTS aspartame, cellacefate, colloidal silicon dioxide, D&C red no. 30 aluminum lake, FD&C blue no. 2 aluminum lake, gelatin, magnesium stearate, mannitol, microcrystalline cellulose, modified corn starch, natural and artificial flavors, sodium starch glycolate"
            ],
            "questions": [
                "QUESTIONS OR COMMENTS? call toll-free 1-800-88-ADVIL or ask your pharmacist, doctor or health care professional"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL Junior Strength Advil ® Chewables Ibuprofen Tablets, 100 mg Pain Reliever/Fever Reducer (NSAID) FEVER Aches & Pains NEW! Now for Ages 2-11 LASTS UP TO 8 HOURS Grape 24 Chewable Tablets Principal Display Panel - 100 mg Tablet Bottle Carton"
            ],
            "set_id": "07d4c400-b182-92f7-7574-9e0e94c39cce",
            "id": "60e9724f-3733-45d1-989d-8ee434e91dc0",
            "effective_time": "20250627",
            "version": "9",
            "openfda": {
                "application_number": [
                    "NDA020944"
                ],
                "brand_name": [
                    "JUNIOR STRENGTH ADVIL"
                ],
                "generic_name": [
                    "IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Haleon US Holdings LLC"
                ],
                "product_ndc": [
                    "0573-0179"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN"
                ],
                "rxcui": [
                    "310963",
                    "731536"
                ],
                "spl_id": [
                    "60e9724f-3733-45d1-989d-8ee434e91dc0"
                ],
                "spl_set_id": [
                    "07d4c400-b182-92f7-7574-9e0e94c39cce"
                ],
                "package_ndc": [
                    "0573-0179-20"
                ],
                "is_original_packager": [
                    true
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "ADVIL COLD AND SINUS ibuprofen, pseudoephedrine hydrochloride IBUPROFEN IBUPROFEN PSEUDOEPHEDRINE HYDROCHLORIDE PSEUDOEPHEDRINE D&C YELLOW NO. 10 FD&C RED NO. 40 GELATIN, UNSPECIFIED MEDIUM-CHAIN TRIGLYCERIDES POLYETHYLENE GLYCOL, UNSPECIFIED POTASSIUM HYDROXIDE WATER SORBITOL SORBITAN Advil;C;S"
            ],
            "active_ingredient": [
                "Active ingredients (in each liquid-filled capsule) Solubilized ibuprofen equal to 200 mg ibuprofen (NSAID)* (present as the free acid and potassium salt) Pseudoephedrine HCl 30 mg *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purposes Pain reliever/fever reducer Nasal decongestant"
            ],
            "indications_and_usage": [
                "Uses temporarily relieves these symptoms associated with the common cold or flu: headache fever sinus pressure nasal congestion minor body aches and pains"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you: are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attack and stroke warning: NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use in children under 12 years of age if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery if you are now taking a prescription monoamine oxidase inhibitor (MAOI) (certain drugs for depression, psychiatric, or emotional conditions, or Parkinson's disease), or for 2 weeks after stopping the MAOI drug. If you do not know if your prescription drug contains an MAOI, ask a doctor or pharmacist before taking this product. Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, thyroid disease, diabetes, have trouble urinating due to an enlarged prostate gland, or had a stroke you are taking a diuretic Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking any other product that contains pseudoephedrine or any other nasal decongestant taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product take with food or milk if stomach upset occurs Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling fever gets worse or lasts more than 3 days nasal congestion lasts for more than 7 days symptoms continue or get worse redness or swelling is present in the painful area you get nervous, dizzy, or sleepless any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use in children under 12 years of age if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery if you are now taking a prescription monoamine oxidase inhibitor (MAOI) (certain drugs for depression, psychiatric, or emotional conditions, or Parkinson's disease), or for 2 weeks after stopping the MAOI drug. If you do not know if your prescription drug contains an MAOI, ask a doctor or pharmacist before taking this product."
            ],
            "ask_doctor": [
                "Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, thyroid disease, diabetes, have trouble urinating due to an enlarged prostate gland, or had a stroke you are taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking any other product that contains pseudoephedrine or any other nasal decongestant taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling fever gets worse or lasts more than 3 days nasal congestion lasts for more than 7 days symptoms continue or get worse redness or swelling is present in the painful area you get nervous, dizzy, or sleepless any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions do not take more than directed the smallest effective dose should be used adults and children 12 years of age and over: take 1 capsule every 4 to 6 hours while symptoms persist. If symptoms do not respond to 1 capsule, 2 capsules may be used. do not use more than 6 capsules in any 24-hour period unless directed by a doctor children under 12 years of age: do not use"
            ],
            "spl_unclassified_section": [
                "Other information each capsule contains: potassium 20 mg store at 20-25°C (68-77°F). Avoid excessive heat above 40°C (104°F). read all warnings and directions before use. Keep carton.",
                "Additional Information READ AND KEEP CARTON FOR COMPLETE WARNINGS AND INFORMATION Product inside sealed in plastic blister with foil backing. Do Not Use if plastic blister or foil barrier is broken."
            ],
            "inactive_ingredient": [
                "Inactive ingredients D&C yellow no. 10, FD&C red no. 40, gelatin, medium-chain triglycerides, pharmaceutical ink, polyethylene glycol, potassium hydroxide, purified water, sorbitol sorbitan solution"
            ],
            "questions": [
                "Questions or comments? Call weekdays from 9 AM to 5 PM EST toll free at 1-800-88-ADVIL"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL Advil COLD & SINUS Non-Drowsy Ibuprofen 200 mg ‣ Pain Reliever/Fever Reducer (NSAID) Pseudoephedrine HCl 30 mg ‣ Nasal Decongestant Relieves Sinus Pressure, Nasal Congestion and Fever LIQUI-GELS ® Advil C & S 32 LIQUID-FILLED CAPSULES Advil Cold & Sinus Liqui-Gels 200mg 30mg Blister Pack Carton"
            ],
            "set_id": "0da9ed22-bfb4-d61b-110b-0c7760332a98",
            "id": "57c53749-0be1-d204-e063-6394a90a2704",
            "effective_time": "20260729",
            "version": "14",
            "openfda": {
                "application_number": [
                    "NDA021374"
                ],
                "brand_name": [
                    "ADVIL COLD AND SINUS"
                ],
                "generic_name": [
                    "IBUPROFEN, PSEUDOEPHEDRINE HYDROCHLORIDE"
                ],
                "manufacturer_name": [
                    "Haleon US Holdings LLC"
                ],
                "product_ndc": [
                    "0573-0184"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN",
                    "PSEUDOEPHEDRINE HYDROCHLORIDE"
                ],
                "rxcui": [
                    "1299018"
                ],
                "spl_id": [
                    "57c53749-0be1-d204-e063-6394a90a2704"
                ],
                "spl_set_id": [
                    "0da9ed22-bfb4-d61b-110b-0c7760332a98"
                ],
                "package_ndc": [
                    "0573-0184-32",
                    "0573-0184-16"
                ],
                "is_original_packager": [
                    true
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM",
                    "6V9V2RYJ8N"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "Advil Targeted Relief camphor, capsaicin, menthol, methyl salicylate CARBOMER HOMOPOLYMER, UNSPECIFIED TYPE CETYL ALCOHOL CETYL ESTERS WAX ISOCETYL STEARATE CARNAUBA WAX OLETH-3 PHOSPHATE WATER SODIUM HYDROXIDE STEARIC ACID CAMPHOR (NATURAL) CAMPHOR (NATURAL) CAPSAICIN CAPSAICIN MENTHOL, UNSPECIFIED FORM MENTHOL, UNSPECIFIED FORM METHYL SALICYLATE SALICYLIC ACID"
            ],
            "active_ingredient": [
                "Active ingredients Camphor 3.1% Capsaicin 0.025% Menthol 10% Methyl salicylate 15%"
            ],
            "purpose": [
                "Purposes Topical analgesic Topical analgesic Topical analgesic Topical analgesic"
            ],
            "indications_and_usage": [
                "Uses Temporarily relieves minor aches and pains of muscles and joints associated with: arthritis strains simple backache bruises sprains"
            ],
            "warnings": [
                "Warnings For external use only avoid contact with eyes. If eye contact occurs, rinse thoroughly with water. Do not use on wounds or damaged skin with a heating pad if you are allergic to any ingredients in this product Ask a doctor before use if you have redness over the affected area When using this product do not bandage tightly Stop use and ask a doctor if condition worsens or if symptoms last for more than 7 days symptoms clear up and occur again within a few days rash, itching or skin irritation develops If pregnant or breast-feeding, ask a health professional before use Keep out of reach of children. If swallowed, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use on wounds or damaged skin with a heating pad if you are allergic to any ingredients in this product"
            ],
            "ask_doctor": [
                "Ask a doctor before use if you have redness over the affected area"
            ],
            "when_using": [
                "When using this product do not bandage tightly"
            ],
            "stop_use": [
                "Stop use and ask a doctor if condition worsens or if symptoms last for more than 7 days symptoms clear up and occur again within a few days rash, itching or skin irritation develops"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use"
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. If swallowed, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions use only as directed adults and children 12 years and older: apply to affected area not more than 3 to 4 times daily children under 12 years of age: consult your doctor wash hands after applying"
            ],
            "storage_and_handling": [
                "Other information store between 20-25°C (68-77°F)"
            ],
            "inactive_ingredient": [
                "Inactive ingredients carbomer homopolymer, cetyl alcohol, cetyl esters wax, emulsifying wax, oleth-3-phosphate, purified water, sodium hydroxide, stearic acid"
            ],
            "questions": [
                "Questions or comments? call toll-free 1-800-88-ADVIL Additional information DEEP PENETRATING RELIEF BACK & BODY ACHES ARTHRITIS & JOINT PAIN SPRAINS & STRAINS SORE MUSCLES STARTS WORKING ON CONTACT FOR UP TO 8 HOURS OF POWERFUL RELIEF UP TO 8 HRS HOW TO USE Clean and dry affected area Remove cap Gently squeeze to dispense cream Massage cream into skin Starts to soothe on contact Do Not Use if tube seal under cap is broken or missing. Distributed by: Haleon, Warren, NJ 07059 ©2023 Haleon group of companies or its licensor. Trademarks are owned by or licensed to the Haleon group of companies. For most recent product information, visit www.Advil.com Made in Canada"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL NEW HALEON DOES NOT CONTAIN THE SAME ACTIVE INGREDIENT AS ADVIL Advil TARGETED RELIEF PAIN RELIEVING CREAM 4 POWERFUL PAIN FIGHTING INGREDIENTS Arthritis & Joint Pain Sprains & Strains Back & Body aches Sore Muscles FOR EXTERNAL USE ONLY NET WT. 65 g (2.3 oz) 206239 Front 206239 Advil Targeted Relief 65 g (2.3 oz)"
            ],
            "set_id": "16e6be21-7b43-443a-89ec-3bdf0ec0dfc1",
            "id": "10e39c07-0913-c1b0-e063-6394a90aff82",
            "effective_time": "20240208",
            "version": "1",
            "openfda": {
                "application_number": [
                    "M017"
                ],
                "brand_name": [
                    "Advil Targeted Relief"
                ],
                "generic_name": [
                    "CAMPHOR, CAPSAICIN, MENTHOL, METHYL SALICYLATE"
                ],
                "manufacturer_name": [
                    "Haleon US Holdings LLC"
                ],
                "product_ndc": [
                    "0573-6555"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "TOPICAL"
                ],
                "substance_name": [
                    "CAMPHOR (NATURAL)",
                    "CAPSAICIN",
                    "MENTHOL, UNSPECIFIED FORM",
                    "METHYL SALICYLATE"
                ],
                "rxcui": [
                    "2049725"
                ],
                "spl_id": [
                    "10e39c07-0913-c1b0-e063-6394a90aff82"
                ],
                "spl_set_id": [
                    "16e6be21-7b43-443a-89ec-3bdf0ec0dfc1"
                ],
                "package_ndc": [
                    "0573-6555-54",
                    "0573-6555-45",
                    "0573-6555-48",
                    "0573-6555-51"
                ],
                "is_original_packager": [
                    true
                ],
                "unii": [
                    "N20HL7Q941",
                    "S07O44R1ZM",
                    "L7T10EIP3A",
                    "LAV5U5022Y"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "ADVIL ibuprofen IBUPROFEN IBUPROFEN CROSCARMELLOSE SODIUM FD&C RED NO. 40 FD&C YELLOW NO. 6 FERRIC OXIDE RED GELATIN, UNSPECIFIED GLYCERIN HYPROMELLOSE, UNSPECIFIED MEDIUM-CHAIN TRIGLYCERIDES PROPYL GALLATE SILICON DIOXIDE SODIUM LAURYL SULFATE STARCH, CORN STEARIC ACID TITANIUM DIOXIDE TRIACETIN WATER one side is brown while the other side is yellow Advil ADVIL ibuprofen IBUPROFEN IBUPROFEN MICROCRYSTALLINE CELLULOSE CROSCARMELLOSE SODIUM FERRIC OXIDE RED METHYLPARABEN POVIDONE, UNSPECIFIED PROPYLPARABEN SHELLAC SILICON DIOXIDE SODIUM BENZOATE SODIUM LAURYL SULFATE STARCH, CORN STEARIC ACID SUCROSE TITANIUM DIOXIDE WHITE WAX DIACETYLATED MONOGLYCERIDES pinkish brown Advil ADVIL ibuprofen IBUPROFEN IBUPROFEN MICROCRYSTALLINE CELLULOSE CROSCARMELLOSE SODIUM FERRIC OXIDE RED METHYLPARABEN POVIDONE, UNSPECIFIED PROPYLPARABEN SHELLAC SILICON DIOXIDE SODIUM BENZOATE SODIUM LAURYL SULFATE STARCH, CORN STEARIC ACID SUCROSE TITANIUM DIOXIDE WHITE WAX DIACETYLATED MONOGLYCERIDES pinkish brown Advil ADVIL ibuprofen IBUPROFEN IBUPROFEN MICROCRYSTALLINE CELLULOSE CROSCARMELLOSE SODIUM FERRIC OXIDE RED METHYLPARABEN POVIDONE, UNSPECIFIED PROPYLPARABEN SHELLAC SILICON DIOXIDE SODIUM BENZOATE SODIUM LAURYL SULFATE STARCH, CORN STEARIC ACID SUCROSE TITANIUM DIOXIDE WHITE WAX DIACETYLATED MONOGLYCERIDES pinkish brown Advil ADVIL ibuprofen IBUPROFEN IBUPROFEN CROSCARMELLOSE SODIUM FD&C RED NO. 40 FD&C YELLOW NO. 6 FERRIC OXIDE RED GELATIN, UNSPECIFIED GLYCERIN HYPROMELLOSE, UNSPECIFIED MEDIUM-CHAIN TRIGLYCERIDES PROPYL GALLATE SILICON DIOXIDE SODIUM LAURYL SULFATE STARCH, CORN STEARIC ACID TITANIUM DIOXIDE TRIACETIN WATER one side is brown while the other side is yellow Advil ADVIL ibuprofen IBUPROFEN IBUPROFEN MICROCRYSTALLINE CELLULOSE CROSCARMELLOSE SODIUM FERRIC OXIDE RED METHYLPARABEN POVIDONE, UNSPECIFIED PROPYLPARABEN SHELLAC SILICON DIOXIDE SODIUM BENZOATE SODIUM LAURYL SULFATE STARCH, CORN STEARIC ACID SUCROSE TITANIUM DIOXIDE WHITE WAX DIACETYLATED MONOGLYCERIDES pinkish brown Advil ADVIL ibuprofen IBUPROFEN IBUPROFEN MICROCRYSTALLINE CELLULOSE CROSCARMELLOSE SODIUM FERRIC OXIDE RED METHYLPARABEN POVIDONE, UNSPECIFIED PROPYLPARABEN SHELLAC SILICON DIOXIDE SODIUM BENZOATE SODIUM LAURYL SULFATE STARCH, CORN STEARIC ACID SUCROSE TITANIUM DIOXIDE WHITE WAX DIACETYLATED MONOGLYCERIDES pinkish brown Advil ADVIL ibuprofen IBUPROFEN IBUPROFEN MICROCRYSTALLINE CELLULOSE CROSCARMELLOSE SODIUM FERRIC OXIDE RED METHYLPARABEN POVIDONE, UNSPECIFIED PROPYLPARABEN SHELLAC SILICON DIOXIDE SODIUM BENZOATE SODIUM LAURYL SULFATE STARCH, CORN STEARIC ACID SUCROSE TITANIUM DIOXIDE WHITE WAX DIACETYLATED MONOGLYCERIDES pinkish brown Advil"
            ],
            "active_ingredient": [
                "Active Ingredient Advil Tablets (in each tablet) Ibuprofen 200 mg (NSAID)* *nonsteroidal anti-inflammatory drug Advil Caplets (in each caplet) Ibuprofen 200 mg (NSAID)* *nonsteroidal anti-inflammatory drug Advil Gel Caplets (in each gel caplet) Ibuprofen 200 mg (NSAID)* *nonsteroidal anti-inflammatory drug",
                "Advil Tablets (in each tablet) Ibuprofen 200 mg (NSAID)* *nonsteroidal anti-inflammatory drug",
                "Advil Caplets (in each caplet) Ibuprofen 200 mg (NSAID)* *nonsteroidal anti-inflammatory drug",
                "Advil Gel Caplets (in each gel caplet) Ibuprofen 200 mg (NSAID)* *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purpose Pain reliever/Fever reducer"
            ],
            "indications_and_usage": [
                "Uses temporarily relieves minor aches and pains due to: headache toothache backache menstrual cramps the common cold muscular aches minor pain of arthritis temporarily reduces fever"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or non-prescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attack and stroke warning: NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product take with food or milk if stomach upset occurs Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days fever gets worse or lasts more than 3 days redness or swelling is present in the painful area any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days fever gets worse or lasts more than 3 days redness or swelling is present in the painful area any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions Advil Tablets do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 tablet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 tablet, 2 tablets may be used do not exceed 6 tablets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor Advil Caplets do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 caplet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 caplet, 2 caplets may be used do not exceed 6 caplets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor Advil Gel Caplets do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 gel caplet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 gel caplet, 2 gel caplets may be used do not exceed 6 gel caplets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor",
                "Advil Tablets do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 tablet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 tablet, 2 tablets may be used do not exceed 6 tablets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor",
                "Advil Caplets do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 caplet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 caplet, 2 caplets may be used do not exceed 6 caplets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor",
                "Advil Gel Caplets do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 gel caplet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 gel caplet, 2 gel caplets may be used do not exceed 6 gel caplets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor"
            ],
            "spl_unclassified_section": [
                "Other information read all warnings and directions before use. Keep carton. store at 20-25°C (68-77°F) avoid excessive heat above 40°C (104°F)",
                "Additional Information (Tablets) Do Not Use if seal under bottle cap imprinted with “SEALED for YOUR PROTECTION” is broken or missing. READ AND KEEP CARTON FOR COMPLETE WARNINGS AND INFORMATION"
            ],
            "inactive_ingredient": [
                "Inactive ingredients Advil Tablets acetylated monoglycerides, colloidal silicon dioxide, corn starch, croscarmellose sodium, methylparaben, microcrystalline cellulose, pharmaceutical glaze, pharmaceutical ink, povidone, pregelatinized starch, propylparaben, sodium benzoate, sodium lauryl sulfate, stearic acid, sucrose, synthetic iron oxide, titanium dioxide, white wax Advil Caplets acetylated monoglycerides, colloidal silicon dioxide, corn starch, croscarmellose sodium, methylparaben, microcrystalline cellulose, pharmaceutical glaze, pharmaceutical ink, povidone, pregelatinized starch, propylparaben, sodium benzoate, sodium lauryl sulfate, stearic acid, sucrose, synthetic iron oxide, titanium dioxide, white wax Advil Gel Caplets colloidal silicon dioxide, corn starch, croscarmellose sodium, FD&C red no. 40, FD&C yellow no. 6, fractionated coconut oil, gelatin, glycerin, hypromellose, pharmaceutical ink, pregelatinized starch, propyl gallate, purified water, sodium lauryl sulfate, stearic acid, synthetic iron oxides, titanium dioxide, triacetin Questions or comments? call toll free 1-800-88-ADVIL",
                "Advil Tablets acetylated monoglycerides, colloidal silicon dioxide, corn starch, croscarmellose sodium, methylparaben, microcrystalline cellulose, pharmaceutical glaze, pharmaceutical ink, povidone, pregelatinized starch, propylparaben, sodium benzoate, sodium lauryl sulfate, stearic acid, sucrose, synthetic iron oxide, titanium dioxide, white wax",
                "Advil Caplets acetylated monoglycerides, colloidal silicon dioxide, corn starch, croscarmellose sodium, methylparaben, microcrystalline cellulose, pharmaceutical glaze, pharmaceutical ink, povidone, pregelatinized starch, propylparaben, sodium benzoate, sodium lauryl sulfate, stearic acid, sucrose, synthetic iron oxide, titanium dioxide, white wax",
                "Advil Gel Caplets colloidal silicon dioxide, corn starch, croscarmellose sodium, FD&C red no. 40, FD&C yellow no. 6, fractionated coconut oil, gelatin, glycerin, hypromellose, pharmaceutical ink, pregelatinized starch, propyl gallate, purified water, sodium lauryl sulfate, stearic acid, synthetic iron oxides, titanium dioxide, triacetin"
            ],
            "questions": [
                "Questions or comments? call toll free 1-800-88-ADVIL"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL – 100 Gel Caplet Bottle Carton NDC 0573-0165-40 Advil Ibuprofen Tablets, 200 mg Pain Reliever / Fever Reducer (NSAID) 100 Coated Gel Caplets* *Capsule-Shaped Gelatin-Coated Tablets Gel Caplets 000067202 Front Carton Advil Gel Caps 100ct",
                "PRINCIPAL DISPLAY PANEL - 300 Tablet Bottle Label Advil ® Ibuprofen Tablets, 200 mg Pain Reliever/Fever Reducer (NSAID) 300 Coated Tablets Tablets Advil Coated Tablets 300ct",
                "PRINCIPAL DISPLAY PANEL - 115 Tablet Bottle Carton 15 FREE TABLETS Advil ® Ibuprofen Tablets, 200 mg Pain Reliever/Fever Reducer (NSAID) 115 Coated Tablets Tablets Advil Coated Tablets 115",
                "PRINCIPAL DISPLAY PANEL - 225 Caplet Bottle Carton 25 FREE CAPLETS Advil ® Ibuprofen Tablets, 200 mg Pain Reliever/Fever Reducer (NSAID) 225 Coated Caplets* *Capsule-Shaped Tablets Caplets Advil Coated Caplets 225 ct",
                "PRINCIPAL DISPLAY PANEL - 24 Tablet Bottle Carton Advil Ibuprofen Tablets, 200 mg Pain Reliever/Fever Reducer (NSAID) 24 Coated Tablets Actual Size Tablets Advil Tablets 24 ct",
                "PRINCIPAL DISPLAY PANEL - 100 Tablet Bottle Label Advil ® Ibuprofen Tablets, 200 mg Pain Reliever/Fever Reducer (NSAID) 100 Tablets Tablets READ AND KEEP CARTON FOR COMPLETE WARNINGS AND INFORMATION Do Not Use if seal under bottle cap imprinted with \"SEALED for YOUR PROTECTION\" is broken or missing. Advil Tablets 100ct",
                "PRINCIPAL DISPLAY PANEL - 24 Caplet Bottle Carton NDC 0573-0160-20 Advil Ibuprofen Tablets, 200 mg Pain Reliever/Fever Reducer (NSAID) 24 Coated Caplets* *Capsule-Shaped Tablets Caplets 000067201 Front Carton Advil Tablets Capsule Shaped 24ct",
                "Principal Display Panel - 225 Caplet Bottle Label NDC 0573-1711-14 Advil® Ibuprofen Tablets, 200 mg Pain Reliever/Fever Reducer (NSAID) 225 Caplets Caplets READ AND KEEP CARTON FOR COMPLETE WARNINGS AND INFORMATION PAA085439 Bottle Label PAA085439 Advil Caplets 225 Caplets"
            ],
            "set_id": "1a665e64-9f30-be37-4a83-38789f1f1e89",
            "id": "5f675a2c-cd5d-ac5f-e063-6294a90abdc7",
            "effective_time": "20261103",
            "version": "39",
            "openfda": {
                "application_number": [
                    "NDA018989"
                ],
                "brand_name": [
                    "ADVIL"
                ],
                "generic_name": [
                    "IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Haleon US Holdings LLC"
                ],
                "product_ndc": [
                    "0573-0150",
                    "0573-0165",
                    "0573-0154",
                    "0573-0151",
                    "0573-0161",
                    "0573-0166",
                    "0573-0160",
                    "0573-1711"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN"
                ],
                "spl_id": [
                    "5f675a2c-cd5d-ac5f-e063-6294a90abdc7"
                ],
                "spl_set_id": [
                    "1a665e64-9f30-be37-4a83-38789f1f1e89"
                ],
                "package_ndc": [
                    "0573-0165-20",
                    "0573-0165-30",
                    "0573-0165-40",
                    "0573-0165-41",
                    "0573-0165-42",
                    "0573-0165-31",
                    "0573-0165-25",
                    "0573-0154-35",
                    "0573-0154-75",
                    "0573-0154-17",
                    "0573-0154-89",
                    "0573-0154-84",
                    "0573-0154-98",
                    "0573-0154-16",
                    "0573-0154-60",
                    "0573-0154-59",
                    "0573-0154-21",
                    "0573-0151-12",
                    "0573-0151-13",
                    "0573-0151-10",
                    "0573-0151-21",
                    "0573-0151-20",
                    "0573-0151-48",
                    "0573-0151-30",
                    "0573-0151-05",
                    "0573-0151-40",
                    "0573-0161-35",
                    "0573-0161-51",
                    "0573-0161-85",
                    "0573-0161-65",
                    "0573-0166-51",
                    "0573-0166-85",
                    "0573-0150-20",
                    "0573-0150-30",
                    "0573-0150-40",
                    "0573-0150-31",
                    "0573-0150-32",
                    "0573-0150-41",
                    "0573-0150-42",
                    "0573-0160-20",
                    "0573-0160-30",
                    "0573-0160-40",
                    "0573-0160-25",
                    "0573-0160-31",
                    "0573-0160-41",
                    "0573-0160-42",
                    "0573-0160-17",
                    "0573-1711-14"
                ],
                "is_original_packager": [
                    true
                ],
                "upc": [
                    "0305730150200"
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "Advil ibuprofen IBUPROFEN IBUPROFEN FD&C GREEN NO. 3 GELATIN, UNSPECIFIED SOYBEAN LECITHIN MEDIUM-CHAIN TRIGLYCERIDES POLYETHYLENE GLYCOL, UNSPECIFIED POTASSIUM HYDROXIDE WATER SORBITAN SORBITOL Transparent green to blue green oblong softgel Advil Advil ibuprofen IBUPROFEN IBUPROFEN FD&C GREEN NO. 3 GELATIN, UNSPECIFIED SOYBEAN LECITHIN MEDIUM-CHAIN TRIGLYCERIDES POLYETHYLENE GLYCOL, UNSPECIFIED POTASSIUM HYDROXIDE WATER SORBITAN SORBITOL Transparent green to blue green oblong softgel Advil Advil ibuprofen IBUPROFEN IBUPROFEN FD&C GREEN NO. 3 GELATIN, UNSPECIFIED MEDIUM-CHAIN TRIGLYCERIDES POLYETHYLENE GLYCOL, UNSPECIFIED POTASSIUM HYDROXIDE WATER SORBITOL SORBITAN transparent green to blue green oblong softgel Advil"
            ],
            "active_ingredient": [
                "Active ingredient (in each capsule) Solubilized ibuprofen equal to 200 mg ibuprofen (NSAID)* (present as the free acid and potassium salt) *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purpose Pain reliever/Fever reducer"
            ],
            "indications_and_usage": [
                "Uses temporarily relieves minor aches and pains due to: headache toothache backache menstrual cramps the common cold muscular aches minor pain of arthritis temporarily reduces fever"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attack and stroke warning: NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product take with food or milk if stomach upset occurs Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days fever gets worse or lasts more than 3 days redness or swelling is present in the painful area any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days fever gets worse or lasts more than 3 days redness or swelling is present in the painful area any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 capsule every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 capsule, 2 capsules may be used do not exceed 6 capsules in 24 hours, unless directed by a doctor children under 12 years: ask a doctor"
            ],
            "spl_unclassified_section": [
                "Other information each capsule contains: potassium 20 mg read all warnings and directions before use. Keep carton. store at 20-25°C (68-77°F) avoid excessive heat above 40°C (104°F)",
                "Additional Information Do Not Use if seal under bottle cap imprinted with “SEALED for YOUR PROTECTION” is broken or missing."
            ],
            "inactive_ingredient": [
                "Inactive ingredients Advil Liqui-Gels FD&C green no. 3, gelatin, lecithin (soybean), medium-chain triglycerides, pharmaceutical ink, polyethylene glycol, potassium hydroxide, purified water, sorbitol sorbitan solution Advil Liqui-Gels Minis FD&C green no. 3, gelatin, medium-chain triglycerides, pharmaceutical ink, polyethylene glycol, potassium hydroxide, purified water, sorbitol sorbitan solution"
            ],
            "questions": [
                "Questions or comments? – Advil Liqui-Gels and Liqui-Gel Minis call toll free 1-855-297-3031",
                "Questions or comments? - Easy Open Arthritis Bottle call toll free 1-800-88-ADVIL"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL Advil ® LIQUI•GELS ® Solubilized Ibuprofen Capsules, 200 mg Pain Reliever/Fever Reducer (NSAID) Actual Size 20 Liquid Filled Capsules Advil LiquiGels 20 ct",
                "PRINCIPAL DISPLAY PANEL- 160 Capsule Bottle Label Easy Open ARTHRITIS CAP EASE OF USE CERTIFIED Arthritis Foundation Advil Liqui-Gels® Solubilized Ibuprofen Capsules, 200 mg Pain Reliever/Fever Reducer (NSAID) THIS PACKAGE FOR HOUSEHOLDS WITHOUT YOUNG CHILDREN Actual Size 160 Liquid Filled Capsules Advil LiquiGels Easy Open 160 ct",
                "PRINCIPAL DISPLAY PANEL Smaller Capsule Same Strength* Advil ® LIQUI•GELS ® minis Solubilized Ibuprofen Capsules, 200 mg Pain Reliever/Fever Reducer (NSAID) *Compared to Advil ® Liqui-Gels ® Actual Size 20 Liquid Filled Capsules Advil LiquiGel Minis 20 ct"
            ],
            "set_id": "1f01c10a-9434-91a4-2ee4-352315a6b610",
            "id": "57c53bdc-fb89-a4d9-e063-6294a90a1bfb",
            "effective_time": "20260729",
            "version": "37",
            "openfda": {
                "application_number": [
                    "NDA020402"
                ],
                "brand_name": [
                    "Advil"
                ],
                "generic_name": [
                    "IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Haleon US Holdings LLC"
                ],
                "product_ndc": [
                    "0573-0149",
                    "0573-0169",
                    "0573-1769"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN"
                ],
                "rxcui": [
                    "310964",
                    "731533"
                ],
                "spl_id": [
                    "57c53bdc-fb89-a4d9-e063-6294a90a1bfb"
                ],
                "spl_set_id": [
                    "1f01c10a-9434-91a4-2ee4-352315a6b610"
                ],
                "package_ndc": [
                    "0573-0169-17",
                    "0573-0169-02",
                    "0573-0169-19",
                    "0573-0169-20",
                    "0573-0169-40",
                    "0573-0169-11",
                    "0573-0169-89",
                    "0573-0169-30",
                    "0573-0169-31",
                    "0573-0169-86",
                    "0573-0169-51",
                    "0573-0169-43",
                    "0573-0169-49",
                    "0573-0169-52",
                    "0573-0169-08",
                    "0573-0169-22",
                    "0573-0169-13",
                    "0573-0169-76",
                    "0573-0169-16",
                    "0573-0149-13",
                    "0573-0149-04",
                    "0573-0149-66",
                    "0573-0149-91",
                    "0573-1769-20",
                    "0573-1769-80",
                    "0573-1769-89",
                    "0573-1769-14",
                    "0573-1769-13",
                    "0573-1769-09",
                    "0573-1769-02",
                    "0573-1769-87",
                    "0573-1769-16",
                    "0573-1769-31",
                    "0573-1769-92"
                ],
                "is_original_packager": [
                    true
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "CHILDRENS ADVIL ibuprofen IBUPROFEN IBUPROFEN CARBOXYMETHYLCELLULOSE SODIUM, UNSPECIFIED CITRIC ACID MONOHYDRATE EDETATE DISODIUM FD&C BLUE NO. 1 GLYCERIN MICROCRYSTALLINE CELLULOSE POLYSORBATE 80 PROPYLENE GLYCOL WATER SODIUM BENZOATE SODIUM CITRATE, UNSPECIFIED FORM SORBITOL SUCROSE XANTHAN GUM Translucent, medium dark blue CHILDRENS ADVIL ibuprofen IBUPROFEN IBUPROFEN ACETIC ACID BUTYLATED HYDROXYTOLUENE CARBOXYMETHYLCELLULOSE SODIUM, UNSPECIFIED CITRIC ACID MONOHYDRATE EDETATE DISODIUM FD&C BLUE NO. 1 GLYCERIN MICROCRYSTALLINE CELLULOSE POLYSORBATE 80 PROPYLENE GLYCOL FD&C RED NO. 40 WATER SODIUM BENZOATE SORBITOL SUCROSE XANTHAN GUM Translucent purple CHILDRENS ADVIL ibuprofen IBUPROFEN IBUPROFEN CARBOXYMETHYLCELLULOSE SODIUM, UNSPECIFIED CITRIC ACID MONOHYDRATE EDETATE DISODIUM FD&C RED NO. 40 GLYCERIN MICROCRYSTALLINE CELLULOSE POLYSORBATE 80 WATER SODIUM BENZOATE SORBITOL SUCROSE XANTHAN GUM Translucent red CHILDRENS ADVIL ibuprofen IBUPROFEN IBUPROFEN ACETIC ACID BUTYLATED HYDROXYTOLUENE CARBOXYMETHYLCELLULOSE SODIUM, UNSPECIFIED CITRIC ACID MONOHYDRATE EDETATE DISODIUM GLYCERIN MICROCRYSTALLINE CELLULOSE POLYSORBATE 80 PROPYLENE GLYCOL WATER SODIUM BENZOATE SORBITOL SUCROSE XANTHAN GUM CHILDRENS ADVIL ibuprofen IBUPROFEN IBUPROFEN CARBOXYMETHYLCELLULOSE SODIUM, UNSPECIFIED CITRIC ACID MONOHYDRATE EDETATE DISODIUM FD&C RED NO. 40 GLYCERIN MICROCRYSTALLINE CELLULOSE POLYSORBATE 80 PROPYLENE GLYCOL WATER SODIUM BENZOATE SORBITOL SUCROSE XANTHAN GUM CHILDRENS ADVIL ibuprofen IBUPROFEN IBUPROFEN CARBOXYMETHYLCELLULOSE SODIUM, UNSPECIFIED CITRIC ACID MONOHYDRATE EDETATE DISODIUM GLYCERIN MICROCRYSTALLINE CELLULOSE POLYSORBATE 80 PROPYLENE GLYCOL WATER SODIUM BENZOATE SODIUM CITRATE, UNSPECIFIED FORM SORBITOL SUCRALOSE XANTHAN GUM"
            ],
            "active_ingredient": [
                "ACTIVE INGREDIENT (IN EACH 5 ML) Ibuprofen 100 mg (NSAID)* *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "PURPOSE Fever reducer/Pain reliever"
            ],
            "indications_and_usage": [
                "USES temporarily: • reduces fever • relieves minor aches and pains due to the common cold, flu, sore throat, headaches and toothaches"
            ],
            "warnings": [
                "WARNINGS Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: • hives • facial swelling • asthma (wheezing) • shock • skin reddening • rash • blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if the child • has had stomach ulcers or bleeding problems • takes a blood thinning (anticoagulant) or steroid drug • takes other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] • takes more or for a longer time than directed Heart attack and stroke warning NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Sore throat warning: Severe or persistent sore throat or sore throat accompanied by high fever, headache, nausea, and vomiting may be serious. Consult doctor promptly. Do not use more than 2 days or administer to children under 3 years of age unless directed by doctor. Do not use • if the child has ever had an allergic reaction to any other pain reliever/fever reducer • right before or after heart surgery Ask a doctor before use if • stomach bleeding warning applies to the child • child has problems or serious side effects from taking pain relievers or fever reducers • child has a history of stomach problems, such as heartburn • child has high blood pressure, heart disease, liver cirrhosis, kidney disease, or asthma, or had a stroke • child has not been drinking fluids • child has lost a lot of fluid due to vomiting or diarrhea • child is taking a diuretic Ask a doctor or pharmacist before use if the child is • under a doctor's care for any serious condition • taking any other drug When using this product • take with food or milk if stomach upset occurs Stop use and ask a doctor if • child experiences any of the following signs of stomach bleeding: • feels faint • vomits blood • has bloody or black stools • has stomach pain that does not get better • child has symptoms of heart problems or stroke: • chest pain • trouble breathing • weakness in one part or side of body • slurred speech • leg swelling • the child does not get any relief within first day (24 hours) of treatment • fever or pain gets worse or lasts more than 3 days • redness or swelling is present in the painful area • any new symptoms appear Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use • if the child has ever had an allergic reaction to any other pain reliever/fever reducer • right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if • stomach bleeding warning applies to the child • child has problems or serious side effects from taking pain relievers or fever reducers • child has a history of stomach problems, such as heartburn • child has high blood pressure, heart disease, liver cirrhosis, kidney disease, or asthma, or had a stroke • child has not been drinking fluids • child has lost a lot of fluid due to vomiting or diarrhea • child is taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if the child is • under a doctor's care for any serious condition • taking any other drug"
            ],
            "when_using": [
                "When using this product • take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if • child experiences any of the following signs of stomach bleeding: • feels faint • vomits blood • has bloody or black stools • has stomach pain that does not get better • child has symptoms of heart problems or stroke: • chest pain • trouble breathing • weakness in one part or side of body • slurred speech • leg swelling • the child does not get any relief within first day (24 hours) of treatment • fever or pain gets worse or lasts more than 3 days • redness or swelling is present in the painful area • any new symptoms appear"
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "DIRECTIONS • this product does not contain directions or complete warnings for adult use • do not give more than directed • shake well before using • mL = milliliter • find right dose on chart below. If possible, use weight to dose; otherwise use age. • repeat dose every 6-8 hours , if needed • do not use more than 4 times a day • measure only with the dosing cup provided. Dosing cup to be used with Children's Advil Suspension only. Do not use with other products. Dose lines account for product remaining in cup due to thickness of suspension. Dosing Chart Weight (lb) Age (yr) Dose (mL) under 24 lb under 2 yr ask a doctor 24-35 lb 2-3 yr 5 mL 36-47 lb 4-5 yr 7.5 mL 48-59 lb 6-8 yr 10 mL 60-71 lb 9-10 yr 12.5 mL 72-95 lb 11 yr 15 mL"
            ],
            "dosage_and_administration_table": [
                "<table width=\"75%\"><col width=\"25%\"/><col width=\"25%\"/><col width=\"25%\"/><thead><tr><th align=\"center\" styleCode=\"Botrule Lrule Toprule \" valign=\"middle\"><content styleCode=\"bold\">Weight (lb)</content></th><th align=\"center\" styleCode=\"Botrule Toprule \" valign=\"middle\"><content styleCode=\"bold\">Age (yr)</content></th><th align=\"center\" styleCode=\"Rrule Botrule Toprule \" valign=\"middle\"><content styleCode=\"bold\">Dose (mL)</content></th></tr></thead><tbody><tr><td align=\"center\" styleCode=\"Lrule Toprule Botrule \" valign=\"middle\"><paragraph>under 24 lb</paragraph></td><td align=\"center\" styleCode=\"Toprule Botrule \" valign=\"middle\"><paragraph>under 2 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Toprule Botrule \" valign=\"middle\"><paragraph>ask a doctor</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Lrule Botrule \" valign=\"middle\"><paragraph>24-35 lb </paragraph></td><td align=\"center\" styleCode=\"Botrule \" valign=\"middle\"><paragraph>2-3 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>5 mL</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Lrule Botrule \" valign=\"middle\"><paragraph>36-47 lb </paragraph></td><td align=\"center\" styleCode=\"Botrule \" valign=\"middle\"><paragraph>4-5 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>7.5 mL</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Lrule Botrule \" valign=\"middle\"><paragraph>48-59 lb </paragraph></td><td align=\"center\" styleCode=\"Botrule \" valign=\"middle\"><paragraph>6-8 yr </paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>10 mL</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Lrule Botrule \" valign=\"middle\"><paragraph>60-71 lb</paragraph></td><td align=\"center\" styleCode=\"Botrule \" valign=\"middle\"><paragraph>9-10 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>12.5 mL</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Botrule Lrule \" valign=\"middle\"><paragraph>72-95 lb</paragraph></td><td align=\"center\" styleCode=\"Botrule \" valign=\"middle\"><paragraph>11 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>15 mL</paragraph></td></tr></tbody></table>"
            ],
            "spl_unclassified_section": [
                "OTHER INFORMATION Children's Advil Suspension Fruit Flavor; Children's Advil Suspension Grape Flavor; Children's Advil Suspension White Grape Flavor; Children's Advil Bubblegum • each 5 mL contains: sodium 3 mg • one dose lasts 6-8 hours • store at 20-25°C (68-77°F) • see bottom of box for lot number and expiration date Children's Advil Suspension Blue Raspberry Flavor; Children's Advil Suspension Sugar-Free Dye-Free Berry Flavor • each 5 mL contains: sodium 10 mg • one dose lasts 6-8 hours • store at 20-25°C (68-77°F) • see bottom of box for lot number and expiration date"
            ],
            "inactive_ingredient": [
                "INACTIVE INGREDIENTS Children's Advil Suspension Fruit Flavor artificial flavor, carboxymethylcellulose sodium, citric acid monohydrate, edetate disodium, FD&C red no. 40, glycerin, microcrystalline cellulose, polysorbate 80, purified water, sodium benzoate, sorbitol solution, sucrose, xanthan gum Children's Advil Suspension Grape Flavor acetic acid, artificial flavor, butylated hydroxytoluene, carboxymethylcellulose sodium, citric acid monohydrate, edetate disodium, FD&C blue no.1, FD&C red no. 40, glycerin, microcrystalline cellulose, polysorbate 80, propylene glycol, purified water, sodium benzoate, sorbitol solution, sucrose, xanthan gum Children's Advil Suspension Blue Raspberry Flavor artificial and natural flavors, carboxymethylcellulose sodium, citric acid monohydrate, edetate disodium, FD&C blue no. 1, glycerin, microcrystalline cellulose, polysorbate 80, propylene glycol, purified water, sodium benzoate, sodium citrate, sorbitol solution, sucrose, xanthan gum Children's Advil Suspension White Grape Flavor acetic acid, artificial flavor, butylated hydroxytoluene, carboxymethylcellulose sodium, citric acid monohydrate, edetate disodium, glycerin, microcrystalline cellulose, polysorbate 80, propylene glycol, purified water, sodium benzoate, sorbitol solution, sucrose, xanthan gum Children's Advil Suspension Bubblegum Flavor carboxymethylcellulose sodium, citric acid monohydrate, edetate disodium, FD&C red no. 40, glycerin, microcrystalline cellulose, natural and artificial flavor, polysorbate 80, propylene glycol, purified water, sodium benzoate, sorbitol solution, sucrose, xanthan gum Children's Advil Suspension Sugar-Free Dye-Free Berry artificial flavor, +orbate 80, propylene glycol, purified water, sodium benzoate, sodium citrate, sorbitol solution, sucralose, xanthan gum"
            ],
            "questions": [
                "QUESTIONS OR COMMENTS? call toll-free 1-800-88-ADVIL or ask your pharmacist, doctor or health care professional"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL NDC 0573-0174-30 Children's Advil ® Suspension Ibuprofen Oral Suspension 100 mg per 5 mL Pain Reliever/Fever Reducer (NSAID) Fever Aches & Pains Lasts Up To 8 Hours BLUE RASPBERRY! Blue Raspberry-Flavored Liquid for ages 2-11 years 4 FL OZ (120 mL) Alcohol-Free 120 mL Bottle Carton Blue Raspberry",
                "PRINCIPAL DISPLAY PANEL NDC 0573-0171-30 Children's Advil ® Suspension Ibuprofen Oral Suspension 100 mg per 5 mL Pain Reliever/Fever Reducer (NSAID) Fever Aches & Pains Lasts Up To 8 Hours Grape-Flavored Liquid for ages 2-11 years 4 FL OZ (120 mL) Alcohol-Free 120 mL Bottle Carton Grape",
                "PRINCIPAL DISPLAY PANEL NDC 0573-0170-30 Children's Advil ® Suspension Ibuprofen Oral Suspension 100 mg per 5 mL Pain Reliever/Fever Reducer (NSAID) Fever Aches & Pains Lasts Up To 8 Hours Fruit-Flavored Liquid for ages 2-11 years 4 FL OZ (120 mL) Alcohol-Free 120 mL Bottle Carton Fruit",
                "PRINCIPAL DISPLAY PANEL NDC0573-0290-30 Children's Advil ® Suspension Ibuprofen Oral Suspension 100 mg per 5 mL Pain Reliever/Fever Reducer (NSAID) Fever Aches & Pains Lasts Up To 8 Hours Dye-Free WHITE GRAPE White Grape-Flavored Liquid for ages 2-11 years 4 FL OZ (120 mL) Alcohol-Free 120 mL Bottle Carton White Grape",
                "PRINCIPAL DISPLAY PANEL NDC 0573-0207-30 Children's Advil ® Suspension Ibuprofen Oral Suspension 100 mg per 5 mL Pain Reliever/Fever Reducer (NSAID) Fever Aches & Pains Lasts Up To 8 Hours Bubble Gum Bubble Gum-Flavored Liquid for ages 2-11 years 4 FL OZ (120 mL) Alcohol-Free 120 mL Bottle Carton Bubble Gum",
                "PRINCIPAL DISPLAY PANEL NDC 0573-0232-30 SUGAR-FREE Children's Advil ® Suspension Ibuprofen Oral Suspension 100 mg per 5 mL Pain Reliever/Fever Reducer (NSAID) Fever Aches & Pains Lasts Up To 8 Hours Dye-Free BERRY Berry-Flavored Liquid for ages 2-11 years 4 FL OZ (120 mL) Alcohol-Free 120 mL Bottle Carton Berry"
            ],
            "set_id": "3079d932-afb2-94fe-f4ba-a3d8b5198fce",
            "id": "88972802-d04c-4fe3-8c56-3c3d1e3b4218",
            "effective_time": "20240208",
            "version": "20",
            "openfda": {
                "application_number": [
                    "NDA020589"
                ],
                "brand_name": [
                    "CHILDRENS ADVIL"
                ],
                "generic_name": [
                    "IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Haleon US Holdings LLC"
                ],
                "product_ndc": [
                    "0573-0170",
                    "0573-0174",
                    "0573-0171",
                    "0573-0290",
                    "0573-0207",
                    "0573-0232"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN"
                ],
                "rxcui": [
                    "197803",
                    "206878"
                ],
                "spl_id": [
                    "88972802-d04c-4fe3-8c56-3c3d1e3b4218"
                ],
                "spl_set_id": [
                    "3079d932-afb2-94fe-f4ba-a3d8b5198fce"
                ],
                "package_ndc": [
                    "0573-0174-30",
                    "0573-0171-30",
                    "0573-0171-03",
                    "0573-0171-32",
                    "0573-0170-30",
                    "0573-0170-01",
                    "0573-0170-32",
                    "0573-0290-30",
                    "0573-0290-01",
                    "0573-0207-30",
                    "0573-0232-30"
                ],
                "is_original_packager": [
                    true
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "Advil Liquigel ibuprofen FD&C GREEN NO. 3 GELATIN, UNSPECIFIED SOYBEAN LECITHIN MEDIUM-CHAIN TRIGLYCERIDES POLYETHYLENE GLYCOL, UNSPECIFIED POTASSIUM HYDROXIDE WATER SORBITAN SORBITOL IBUPROFEN IBUPROFEN Transparent green to blue green oblong softgel Advil"
            ],
            "active_ingredient": [
                "Active ingredient (in each capsule) Solubilized ibuprofen equal to 200 mg ibuprofen (NSAID)* (present as the free acid and potassium salt) *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purpose Pain reliever/Fever reducer"
            ],
            "indications_and_usage": [
                "Uses temporarily relieves minor aches and pains due to: headache toothache backache menstrual cramps the common cold muscular aches minor pain of arthritis temporarily reduces fever"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attack and stroke warning: NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product take with food or milk if stomach upset occurs Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days fever gets worse or lasts more than 3 days redness or swelling is present in the painful area any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days fever gets worse or lasts more than 3 days redness or swelling is present in the painful area any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 capsule every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 capsule, 2 capsules may be used do not exceed 6 capsules in 24 hours, unless directed by a doctor children under 12 years: ask a doctor"
            ],
            "spl_unclassified_section": [
                "Other information each capsule contains: potassium 20 mg read all warnings and directions before use. Keep carton. store at 20-25°C (68-77°F) avoid excessive heat above 40°C (104°F)"
            ],
            "inactive_ingredient": [
                "Inactive ingredients Advil Liqui-Gels FD&C green no. 3, gelatin, lecithin (soybean), medium-chain triglycerides, pharmaceutical ink, polyethylene glycol, potassium hydroxide, purified water, sorbitol sorbitan solution Advil Liqui-Gels Minis FD&C green no. 3, gelatin, medium-chain triglycerides, pharmaceutical ink, polyethylene glycol, potassium hydroxide, purified water, sorbitol sorbitan solution"
            ],
            "questions": [
                "Questions or comments? call toll free 1-800-88-ADVIL"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL Advil11",
                "Advil2pouch",
                "Advil25",
                "Advil30"
            ],
            "set_id": "3ca6bc9d-090f-e412-e063-6394a90a6876",
            "id": "55bc36f6-45ee-b63d-e063-6294a90a445b",
            "effective_time": "20260703",
            "version": "3",
            "openfda": {
                "application_number": [
                    "NDA020402"
                ],
                "brand_name": [
                    "Advil Liquigel"
                ],
                "generic_name": [
                    "IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Select Consumer Group"
                ],
                "product_ndc": [
                    "85237-1785"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN"
                ],
                "rxcui": [
                    "310964",
                    "731533"
                ],
                "spl_id": [
                    "55bc36f6-45ee-b63d-e063-6294a90a445b"
                ],
                "spl_set_id": [
                    "3ca6bc9d-090f-e412-e063-6394a90a6876"
                ],
                "package_ndc": [
                    "85237-1785-1",
                    "85237-1785-2",
                    "85237-1785-4",
                    "85237-1785-5",
                    "85237-1785-0",
                    "85237-1785-7"
                ],
                "original_packager_product_ndc": [
                    "0573-0149"
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "ADVIL ibuprofen MICROCRYSTALLINE CELLULOSE CROSCARMELLOSE SODIUM FERRIC OXIDE RED METHYLPARABEN POVIDONE, UNSPECIFIED PROPYLPARABEN SHELLAC SILICON DIOXIDE SODIUM BENZOATE SODIUM LAURYL SULFATE STARCH, CORN STEARIC ACID SUCROSE TITANIUM DIOXIDE WHITE WAX DIACETYLATED MONOGLYCERIDES IBUPROFEN IBUPROFEN pinkish brown Advil"
            ],
            "active_ingredient": [
                "Advil Tablets (in each tablet) Ibuprofen 200 mg (NSAID)* Advil Tablets (in each tablet) Ibuprofen 200 mg (NSAID)* *nonsteroidal anti-inflammatory drug",
                "Advil Tablets (in each tablet) Ibuprofen 200 mg (NSAID)* *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purpose Pain reliever/Fever reducer"
            ],
            "indications_and_usage": [
                "Uses temporarily relieves minor aches and pains due to: headache toothache backache menstrual cramps the common cold muscular aches minor pain of arthritis temporarily reduces fever"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or non-prescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attack and stroke warning: NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product take with food or milk if stomach upset occurs Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days fever gets worse or lasts more than 3 days redness or swelling is present in the painful area any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days fever gets worse or lasts more than 3 days redness or swelling is present in the painful area any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions Advil Tablets do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 tablet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 tablet, 2 tablets may be used do not exceed 6 tablets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor Advil Caplets do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 caplet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 caplet, 2 caplets may be used do not exceed 6 caplets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor Advil Gel Caplets do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 gel caplet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 gel caplet, 2 gel caplets may be used do not exceed 6 gel caplets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor",
                "Advil Tablets do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 tablet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 tablet, 2 tablets may be used do not exceed 6 tablets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor",
                "Advil Caplets do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 caplet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 caplet, 2 caplets may be used do not exceed 6 caplets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor",
                "Advil Gel Caplets do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 gel caplet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 gel caplet, 2 gel caplets may be used do not exceed 6 gel caplets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor"
            ],
            "spl_unclassified_section": [
                "Other information read all warnings and directions before use. Keep carton. store at 20-25°C (68-77°F) avoid excessive heat above 40°C (104°F)"
            ],
            "inactive_ingredient": [
                "Inactivre Ingredients acetylated monoglycerides, colloidal silicon dioxide, corn starch, croscarmellose sodium, methylparaben, microcrystalline cellulose, pharmaceutical glaze, pharmaceutical ink, povidone, pregelatinized starch, propylparaben, sodium benzoate, sodium lauryl sulfate, stearic acid, sucrose, synthetic iron oxide, titanium dioxide, white wax"
            ],
            "package_label_principal_display_panel": [
                "Principal Display Pane 1786-1 1786-2 1786-4 1786-6"
            ],
            "set_id": "3ca752d8-957c-21b4-e063-6294a90a5285",
            "id": "55bc239c-85cc-cd1c-e063-6394a90a8038",
            "effective_time": "20260703",
            "version": "2",
            "openfda": {
                "application_number": [
                    "NDA018989"
                ],
                "brand_name": [
                    "ADVIL"
                ],
                "generic_name": [
                    "IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Select Consumer Group"
                ],
                "product_ndc": [
                    "85237-1786"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN"
                ],
                "rxcui": [
                    "153008",
                    "310965"
                ],
                "spl_id": [
                    "55bc239c-85cc-cd1c-e063-6394a90a8038"
                ],
                "spl_set_id": [
                    "3ca752d8-957c-21b4-e063-6294a90a5285"
                ],
                "package_ndc": [
                    "85237-1786-1",
                    "85237-1786-0",
                    "85237-1786-2",
                    "85237-1786-7",
                    "85237-1786-4",
                    "85237-1786-6"
                ],
                "original_packager_product_ndc": [
                    "0573-0150"
                ],
                "upc": [
                    "0655708217863",
                    "0655708017869",
                    "0655708117866",
                    "0655708017913"
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "ADVIL PM diphenhydramine HCl, ibuprofen DIPHENHYDRAMINE HYDROCHLORIDE DIPHENHYDRAMINE IBUPROFEN IBUPROFEN D&C RED NO. 33 FD&C BLUE NO. 1 GELATIN, UNSPECIFIED MEDIUM-CHAIN TRIGLYCERIDES POLYETHYLENE GLYCOL, UNSPECIFIED POTASSIUM HYDROXIDE WATER SORBITAN SORBITOL Clear blue Oval liqui-gel Advil;PM ADVIL PM diphenhydramine HCl, ibuprofen DIPHENHYDRAMINE HYDROCHLORIDE DIPHENHYDRAMINE IBUPROFEN IBUPROFEN D&C RED NO. 33 FD&C BLUE NO. 1 GELATIN, UNSPECIFIED MEDIUM-CHAIN TRIGLYCERIDES POLYETHYLENE GLYCOL, UNSPECIFIED POTASSIUM HYDROXIDE WATER SORBITAN SORBITOL Clear blue Oval liqui-gel Advil;PM;Minis"
            ],
            "active_ingredient": [
                "Active ingredients (in each capsule) Diphenhydramine hydrochloride 25 mg Solubilized ibuprofen equal to 200 mg ibuprofen (NSAID)* (present as the free acid and potassium salt) *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purposes Nighttime sleep-aid Pain reliever"
            ],
            "indications_and_usage": [
                "Uses for relief of occasional sleeplessness when associated with minor aches and pains helps you fall asleep and stay asleep"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attack and stroke warning: NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer unless you have time for a full night's sleep in children under 12 years of age right before or after heart surgery with any other product containing diphenhydramine, even one used on skin if you have sleeplessness without pain Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke. you are taking a diuretic you have a breathing problem such as emphysema or chronic bronchitis you have glaucoma you have trouble urinating due to an enlarged prostate gland Ask a doctor or pharmacist before use if you are taking sedatives or tranquilizers, or any other sleep-aid under a doctor's care for any continuing medical illness taking any other antihistamines taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product drowsiness will occur avoid alcoholic drinks do not drive a motor vehicle or operate machinery take with food or milk if stomach upset occurs Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days sleeplessness persists continuously for more than 2 weeks. Insomnia may be a symptom of a serious underlying medical illness. redness or swelling is present in the painful area any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer unless you have time for a full night's sleep in children under 12 years of age right before or after heart surgery with any other product containing diphenhydramine, even one used on skin if you have sleeplessness without pain"
            ],
            "ask_doctor": [
                "Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke. you are taking a diuretic you have a breathing problem such as emphysema or chronic bronchitis you have glaucoma you have trouble urinating due to an enlarged prostate gland"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are taking sedatives or tranquilizers, or any other sleep-aid under a doctor's care for any continuing medical illness taking any other antihistamines taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product drowsiness will occur avoid alcoholic drinks do not drive a motor vehicle or operate machinery take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days sleeplessness persists continuously for more than 2 weeks. Insomnia may be a symptom of a serious underlying medical illness. redness or swelling is present in the painful area any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions do not take more than directed adults and children 12 years and over: take 2 capsules at bedtime do not take more than 2 capsules in 24 hours"
            ],
            "spl_unclassified_section": [
                "Other information each capsule contains: potassium 20 mg read all warnings and directions before use. Keep carton. store at 20-25°C (68-77°F) avoid excessive heat above 40°C (104°F) protect from light",
                "Additional Information Do Not Use if seal under bottle cap imprinted with “SEALED for YOUR PROTECTION” is broken or missing. READ AND KEEP CARTON FOR COMPLETE WARNINGS AND INFORMATION"
            ],
            "inactive_ingredient": [
                "Inactive ingredients D&C red no. 33, FD&C blue no. 1, gelatin, medium-chain triglycerides, pharmaceutical ink, polyethylene glycol, potassium hydroxide, purified water, sorbitol sorbitan solution"
            ],
            "questions": [
                "Questions or Comments? Call 1-855-297-3031"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL (Advil PM Liqui-Gels) Advil ® PM LIQUI•GELS ® Solubilized Ibuprofen, 200 mg / Diphenhydramine HCl, 25 mg Pain Reliever (NSAID) / Nighttime Sleep-Aid Actual Size 20 Liquid Filled Capsules Advil PM LiquiGels 20 capsules",
                "Principal Display Panel (Advil PM Liqui-Gels Minis) Advil ® PM LIQUI•GELS ® minis Smaller Capsule Same Strength* Solubilized Ibuprofen, 200 mg / Diphenhydramine HCl, 25 mg Pain Reliever (NSAID) / Nighttime Sleep-Aid *Compared to Advil PM Liqui-Gels Actual Size 40 Liquid Filled Capsules Advil PM LG Minis 40 ct"
            ],
            "set_id": "405afdb4-c157-1d88-f232-848063ba4714",
            "id": "57c5339d-4ab8-ce7f-e063-6394a90a75a5",
            "effective_time": "20260729",
            "version": "22",
            "openfda": {
                "application_number": [
                    "NDA021393"
                ],
                "brand_name": [
                    "ADVIL PM"
                ],
                "generic_name": [
                    "DIPHENHYDRAMINE HCL, IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Haleon US Holdings LLC"
                ],
                "product_ndc": [
                    "0573-0148",
                    "0573-0167"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "DIPHENHYDRAMINE HYDROCHLORIDE",
                    "IBUPROFEN"
                ],
                "rxcui": [
                    "901814"
                ],
                "spl_id": [
                    "57c5339d-4ab8-ce7f-e063-6394a90a75a5"
                ],
                "spl_set_id": [
                    "405afdb4-c157-1d88-f232-848063ba4714"
                ],
                "package_ndc": [
                    "0573-0167-10",
                    "0573-0167-20",
                    "0573-0167-21",
                    "0573-0167-25",
                    "0573-0167-43",
                    "0573-0167-55",
                    "0573-0167-18",
                    "0573-0167-19",
                    "0573-0167-26",
                    "0573-0167-42",
                    "0573-0167-44",
                    "0573-0167-56",
                    "0573-0148-06",
                    "0573-0148-07"
                ],
                "is_original_packager": [
                    true
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "TC2D6JAD40",
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "Advil IBUPROFEN DIACETYLATED MONOGLYCERIDES SILICON DIOXIDE STARCH, CORN CROSCARMELLOSE SODIUM METHYLPARABEN MICROCRYSTALLINE CELLULOSE SHELLAC POVIDONE PROPYLPARABEN SODIUM BENZOATE SODIUM LAURYL SULFATE STEARIC ACID SUCROSE TITANIUM DIOXIDE WHITE WAX IBUPROFEN IBUPROFEN one hemisphere is brown while the other hemisphere is yellow smooth in texture with polished surface Advil"
            ],
            "spl_unclassified_section": [
                "Drug Facts",
                "Other information • read all warnings and directions before use. Keep carton. • store at 20-25°C (68-77°F) • avoid excessive heat above 40°C (104°F)"
            ],
            "active_ingredient": [
                "Active ingredient (in each tablet) Ibuprofen 200 mg (NSAID)* *nonsteroidal anti-inflammatory drug Purpose Pain Reliever/Fever Reducer"
            ],
            "purpose": [
                "Purpose Pain Reliever/Fever Reducer"
            ],
            "indications_and_usage": [
                "Uses • temporarily relieves minor aches and pains due to: • headache • toothache • backache • the common cold • muscular aches • minor pain of arthritis • menstrual cramps • temporarily reduces fever"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: • hives • facial swelling • asthma (wheezing) • shock • skin reddening • rash • blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you: • are age 60 or older • have had stomach ulcers or bleeding problems • take a blood thinning (anticoagulant) or steroid drug • take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] • have 3 or more alcoholic drinks every day while using this product • take more or for a longer time than directed Do not use • if you have ever had an allergic reaction to any other pain reliever or fever reducer • right before or after heart surgery Ask a doctor before use if • stomach bleeding warning applies to you • you have problems or serious side effects from taking pain relievers or fever reducers • you have a history of stomach problems, such as heartburn • you have high blood pressure, heart disease, liver cirrhosis, kidney disease, or asthma • you are taking a diuretic Ask a doctor or pharmacist before use if you are • under a doctor’s care for any serious condition • taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin • taking any other drug When using this product • take with food or milk if stomach upset occurs • the risk of heart attack or stroke may increase if you use more than directed or for longer than directed Stop use and ask a doctor if • you expereince any of the following signs of stomach bleeding: • feel faint • vomit blood • have bloody or black stools • have stomach pain that does not get better • pain gets worse or lasts more than 10 days • fever gets worse or lasts more than 3 days • redness or swelling is present in the painful area • any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use • if you have ever had an allergic reaction to any other pain reliever or fever reducer • right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if • stomach bleeding warning applies to you • you have problems or serious side effects from taking pain relievers or fever reducers • you have a history of stomach problems, such as heartburn • you have high blood pressure, heart disease, liver cirrhosis, kidney disease, or asthma • you are taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are • under a doctor’s care for any serious condition • taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin • taking any other drug"
            ],
            "when_using": [
                "When using this product • take with food or milk if stomach upset occurs • the risk of heart attack or stroke may increase if you use more than directed or for longer than directed"
            ],
            "stop_use": [
                "Stop use and ask a doctor if • you expereince any of the following signs of stomach bleeding: • feel faint • vomit blood • have bloody or black stools • have stomach pain that does not get better • pain gets worse or lasts more than 10 days • fever gets worse or lasts more than 3 days • redness or swelling is present in the painful area • any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions • do not take more than directed • the smallest effective dose should be used • adults and children 12 years and over: take 1 tablet every 4 to 6 hours while symptoms persist • if pain or fever does not respond to 1 tablet, 2 tablets may be used • do not exceed 6 tablets in 24 hours, unless directed by a doctor • children under 12 years: ask a doctor"
            ],
            "inactive_ingredient": [
                "Inactive ingredients acetylated monoglycerides, colloidal silicon dioxide, corn starch, croscarmellose sodium, methylparaben, microcrystalline cellulose, pharmaceutical glaze, pharmaceutical ink, povidone, pregelatinized starch, propylparaben, sodium benzoate, sodium lauryl sulfate, stearic acid, sucrose, synthetic iron oxide, titanium dioxide, white wax"
            ],
            "questions": [
                "Questions or comments? Call toll free 1-800-88-ADVIL"
            ],
            "package_label_principal_display_panel": [
                "Package Labeling: Advil"
            ],
            "set_id": "4a64522f-b7d8-47f7-bf07-c9e8f1086425",
            "id": "4efb2a06-f0fc-b6d2-e063-6294a90a92d4",
            "effective_time": "20260408",
            "version": "5",
            "openfda": {
                "application_number": [
                    "NDA018989"
                ],
                "brand_name": [
                    "Advil"
                ],
                "generic_name": [
                    "IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Navajo Manufacturing Company Inc."
                ],
                "product_ndc": [
                    "67751-146"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN"
                ],
                "rxcui": [
                    "153008",
                    "310965"
                ],
                "spl_id": [
                    "4efb2a06-f0fc-b6d2-e063-6294a90a92d4"
                ],
                "spl_set_id": [
                    "4a64522f-b7d8-47f7-bf07-c9e8f1086425"
                ],
                "package_ndc": [
                    "67751-146-01",
                    "67751-146-02",
                    "67751-146-03",
                    "67751-146-06"
                ],
                "original_packager_product_ndc": [
                    "0573-0154"
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "CHILDRENS ADVIL ibuprofen IBUPROFEN IBUPROFEN CARBOXYMETHYLCELLULOSE SODIUM, UNSPECIFIED CITRIC ACID MONOHYDRATE EDETATE DISODIUM GLYCERIN MICROCRYSTALLINE CELLULOSE POLYSORBATE 80 PROPYLENE GLYCOL WATER SODIUM BENZOATE SODIUM CITRATE, UNSPECIFIED FORM SORBITOL SUCROSE XANTHAN GUM Translucent"
            ],
            "active_ingredient": [
                "Active ingredient (in each 5 mL) Ibuprofen 100 mg (NSAID)* *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purpose Fever reducer/Pain reliever"
            ],
            "indications_and_usage": [
                "Uses temporarily: • reduces fever • relieves minor aches and pains due to the common cold, flu, sore throat, headaches and toothaches"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: • hives • facial swelling • asthma (wheezing) • shock • skin reddening • rash • blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if the child • has had stomach ulcers or bleeding problems • takes a blood thinning (anticoagulant) or steroid drug • takes other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] • takes more or for a longer time than directed Heart attack and stroke warning: NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Sore throat warning: Severe or persistent sore throat or sore throat accompanied by high fever, headache, nausea, and vomiting may be serious. Consult doctor promptly. Do not use more than 2 days or administer to children under 3 years of age unless directed by doctor. Do not use • if the child has ever had an allergic reaction to any other pain reliever/fever reducer • right before or after heart surgery Ask a doctor before use if • stomach bleeding warning applies to the child • child has problems or serious side effects from taking pain relievers or fever reducers • child has a history of stomach problems, such as heartburn • child has high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke • child has not been drinking fluids • child has lost a lot of fluid due to vomiting or diarrhea • child is taking a diuretic Ask a doctor or pharmacist before use if the child is • under a doctor's care for any serious condition • taking any other drug When using this product • take with food or milk if stomach upset occurs Stop use and ask a doctor if • child experiences any of the following signs of stomach bleeding: • feels faint • vomits blood • has bloody or black stools • has stomach pain that does not get better • child has symptoms of heart problems or stroke: • chest pain • trouble breathing • weakness in one part or side of body • slurred speech • leg swelling • the child does not get any relief within first day (24 hours) of treatment • fever or pain gets worse or lasts more than 3 days • redness or swelling is present in the painful area • any new symptoms appear Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use • if the child has ever had an allergic reaction to any other pain reliever/fever reducer • right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if • stomach bleeding warning applies to the child • child has problems or serious side effects from taking pain relievers or fever reducers • child has a history of stomach problems, such as heartburn • child has high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke • child has not been drinking fluids • child has lost a lot of fluid due to vomiting or diarrhea • child is taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if the child is • under a doctor's care for any serious condition • taking any other drug"
            ],
            "when_using": [
                "When using this product • take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if • child experiences any of the following signs of stomach bleeding: • feels faint • vomits blood • has bloody or black stools • has stomach pain that does not get better • child has symptoms of heart problems or stroke: • chest pain • trouble breathing • weakness in one part or side of body • slurred speech • leg swelling • the child does not get any relief within first day (24 hours) of treatment • fever or pain gets worse or lasts more than 3 days • redness or swelling is present in the painful area • any new symptoms appear"
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions • this product does not contain directions or complete warnings for adult use • do not give more than directed • shake well before using • mL = milliliter • find right dose on chart below. If possible, use weight to dose; otherwise use age. • repeat dose every 6-8 hours , if needed • do not use more than 4 times a day • measure only with the dosing cup provided. Dosing cup to be used with Children's Advil Suspension only. Do not use with other products. Dose lines account for product remaining in cup due to thickness of suspension. Dosing Chart Weight (lb) Age (yr) Dose (mL) under 24 lb under 2 yr ask a doctor 24-35 lb 2-3 yr 5 mL 36-47 lb 4-5 yr 7.5 mL 48-59 lb 6-8 yr 10 mL 60-71 lb 9-10 yr 12.5 mL 72-95 lb 11 yr 15 mL"
            ],
            "dosage_and_administration_table": [
                "<table width=\"86.66%\"><col width=\"34%\"/><col width=\"26%\"/><col width=\"26%\"/><thead><tr><th align=\"center\" styleCode=\"Botrule Lrule Toprule \" valign=\"middle\"><content styleCode=\"bold\">Weight (lb)</content></th><th align=\"center\" styleCode=\"Botrule Toprule \" valign=\"middle\"><content styleCode=\"bold\">Age (yr)</content></th><th align=\"center\" styleCode=\"Rrule Botrule Toprule \" valign=\"middle\"><content styleCode=\"bold\">Dose (mL)</content></th></tr></thead><tbody><tr><td align=\"center\" styleCode=\"Lrule Toprule Botrule \" valign=\"middle\"><paragraph>under 24 lb</paragraph></td><td align=\"center\" styleCode=\"Toprule Botrule \" valign=\"middle\"><paragraph>under 2 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Toprule Botrule \" valign=\"middle\"><paragraph>ask a doctor</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Lrule Botrule \" valign=\"middle\"><paragraph>24-35 lb </paragraph></td><td align=\"center\" styleCode=\"Botrule \" valign=\"middle\"><paragraph>2-3 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>5 mL</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Lrule Botrule \" valign=\"middle\"><paragraph>36-47 lb </paragraph></td><td align=\"center\" styleCode=\"Botrule \" valign=\"middle\"><paragraph>4-5 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>7.5 mL</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Lrule Botrule \" valign=\"middle\"><paragraph>48-59 lb </paragraph></td><td align=\"center\" styleCode=\"Botrule \" valign=\"middle\"><paragraph>6-8 yr </paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>10 mL</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Lrule Botrule \" valign=\"middle\"><paragraph>60-71 lb</paragraph></td><td align=\"center\" styleCode=\"Botrule \" valign=\"middle\"><paragraph>9-10 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>12.5 mL</paragraph></td></tr><tr><td align=\"center\" styleCode=\"Botrule Lrule \" valign=\"middle\"><paragraph>72-95 lb</paragraph></td><td align=\"center\" styleCode=\"Botrule \" valign=\"middle\"><paragraph>11 yr</paragraph></td><td align=\"center\" styleCode=\"Rrule Botrule \" valign=\"middle\"><paragraph>15 mL</paragraph></td></tr></tbody></table>"
            ],
            "spl_unclassified_section": [
                "Other information • each 5 mL contains: sodium 10 mg • one dose lasts 6-8 hours • store at 20-25°C (68-77°F) • see bottom of box for lot number and expiration date",
                "Additional Information Long Lasting: Up to 8 hours of fever reduction Great Convenience: Long duration means fewer doses needed per day. Alcohol-Free For most recent production information, Visit www.Advil.com Pfizer, Madison, NJ 07940 USA © 2019 Pfizer Inc. Important: Read all product information before using. Keep this box for important information. This product is intended for use in children ages 2 years – 11 years. Packaged with Tamper-Evident bottle cap. Do Not Use if breakable ring is separated or missing."
            ],
            "inactive_ingredient": [
                "Inactive ingredients artificial and natural flavors, carboxymethylcellulose sodium, citric acid monohydrate, edetate disodium, glycerin, microcrystalline cellulose, polysorbate 80, propylene glycol, purified water, sodium benzoate, sodium citrate, sorbitol solution, sucrose, xanthan gum"
            ],
            "questions": [
                "Questions or comments? call toll-free 1-800-88-ADVIL or ask your pharmacist, doctor or health care professional"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL NDC 0573-1174-12 Children's Advil ® Suspension Ibuprofen Oral Suspension 100 mg per 5 mL Pain Reliever/Fever Reducer (NSAID) Fever Aches & Pains Lasts Up To 8 Hours Same Great Flavor! Now Dye-Free Dye-Free BLUE RASPBERRY Blue Raspberry-Flavored Liquid for ages 2-11 years 4 FL OZ (120 mL) Alcohol-Free PAA105480 Front Carton Children's Advil Suspension BR Dye-Free 4 FL oz (120 mL)"
            ],
            "set_id": "4eba2795-e826-480d-afdc-d62004e95f36",
            "id": "e78c4482-deac-46a8-8774-856e1fe5054c",
            "effective_time": "20240208",
            "version": "5",
            "openfda": {
                "application_number": [
                    "NDA020589"
                ],
                "brand_name": [
                    "CHILDRENS ADVIL"
                ],
                "generic_name": [
                    "IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Haleon US Holdings LLC"
                ],
                "product_ndc": [
                    "0573-1174"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN"
                ],
                "rxcui": [
                    "197803",
                    "206878"
                ],
                "spl_id": [
                    "e78c4482-deac-46a8-8774-856e1fe5054c"
                ],
                "spl_set_id": [
                    "4eba2795-e826-480d-afdc-d62004e95f36"
                ],
                "package_ndc": [
                    "0573-1174-12"
                ],
                "is_original_packager": [
                    true
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "ADVIL PM diphenhydramine citrate and ibuprofen CALCIUM STEARATE CARNAUBA WAX SILICON DIOXIDE STARCH, CORN CROSCARMELLOSE SODIUM FD&C BLUE NO. 2 GLYCERYL DIBEHENATE HYPROMELLOSE, UNSPECIFIED LACTOSE MONOHYDRATE MICROCRYSTALLINE CELLULOSE POLYDEXTROSE POLYETHYLENE GLYCOL, UNSPECIFIED SODIUM LAURYL SULFATE SODIUM STARCH GLYCOLATE TYPE A POTATO STEARIC ACID TITANIUM DIOXIDE DIPHENHYDRAMINE CITRATE DIPHENHYDRAMINE IBUPROFEN IBUPROFEN blue Advil;PM"
            ],
            "active_ingredient": [
                "Active ingredients (in each caplet) Diphenhydramine citrate 38 mg Ibuprofen 200 mg (NSAID)* *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purposes Nighttime sleep-aid Pain reliever"
            ],
            "indications_and_usage": [
                "Uses for relief of occasional sleeplessness when associated with minor aches and pains helps you fall asleep and stay asleep"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attack and stroke warning: NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer unless you have time for a full night's sleep in children under 12 years of age right before or after heart surgery with any other product containing diphenhydramine, even one used on skin if you have sleeplessness without pain Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic you have a breathing problem such as emphysema or chronic bronchitis you have glaucoma you have trouble urinating due to an enlarged prostate gland Ask a doctor or pharmacist before use if you are taking sedatives or tranquilizers, or any other sleep-aid under a doctor's care for any continuing medical illness taking any other antihistamines taking aspirin for heart attack or stroke because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product drowsiness will occur avoid alcoholic drinks do not drive a motor vehicle or operate machinery take with food or milk if stomach upset occurs Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days sleeplessness persists continuously for more than 2 weeks. Insomnia may be a symptom of a serious underlying medical illness. redness or swelling is present in the painful area any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer unless you have time for a full night's sleep in children under 12 years of age right before or after heart surgery with any other product containing diphenhydramine, even one used on skin if you have sleeplessness without pain"
            ],
            "ask_doctor": [
                "Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic you have a breathing problem such as emphysema or chronic bronchitis you have glaucoma you have trouble urinating due to an enlarged prostate gland"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are taking sedatives or tranquilizers, or any other sleep-aid under a doctor's care for any continuing medical illness taking any other antihistamines taking aspirin for heart attack or stroke because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product drowsiness will occur avoid alcoholic drinks do not drive a motor vehicle or operate machinery take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days sleeplessness persists continuously for more than 2 weeks. Insomnia may be a symptom of a serious underlying medical illness. redness or swelling is present in the painful area any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions do not take more than directed adults and children 12 years and over: take 2 caplets at bedtime do not take more than 2 caplets in 24 hours"
            ],
            "spl_unclassified_section": [
                "Other ingredients read all warnings and directions before use. Keep carton. store at 20-25°C (68-77°F) avoid excessive heat above 40°C (104°F)",
                "Additional Information Do Not Use if seal under bottle cap imprinted with “SEALED for YOUR PROTECTION” is broken or missing. For most recent product information, visit www.Advil.com. Distributed by: GSK Consumer Healthcare, Warren, NJ 07059 ©2021 GSK or licensor Trademarks owned or licensed by GSK"
            ],
            "inactive_ingredient": [
                "Inactive ingredients calcium stearate, carnauba wax, colloidal silicon dioxide, corn starch, croscarmellose sodium, FD&C blue no. 2 aluminum lake, glyceryl dibehenate, hypromellose, lactose monohydrate, microcrystalline cellulose, pharmaceutical ink, polydextrose, polyethylene glycol, pregelatinized starch, sodium lauryl sulfate, sodium starch glycolate, stearic acid, titanium dioxide"
            ],
            "questions": [
                "Questions or Comments? Call weekdays 9 AM to 5 PM EST at 1-800-88-ADVIL"
            ],
            "package_label_principal_display_panel": [
                "Principal Display Panel Advilpm-2 Advilpm-5 AdvilPM-4 Advil PM-4 Advil PM -1"
            ],
            "set_id": "52c67ae0-707c-851b-e063-6294a90afda4",
            "id": "52c6675a-0f8f-f7bf-e063-6394a90acddc",
            "effective_time": "20260527",
            "version": "1",
            "openfda": {
                "application_number": [
                    "NDA021394"
                ],
                "brand_name": [
                    "ADVIL PM"
                ],
                "generic_name": [
                    "DIPHENHYDRAMINE CITRATE AND IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Select Consumer Group"
                ],
                "product_ndc": [
                    "85237-1784"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "DIPHENHYDRAMINE CITRATE",
                    "IBUPROFEN"
                ],
                "rxcui": [
                    "895664"
                ],
                "spl_id": [
                    "52c6675a-0f8f-f7bf-e063-6394a90acddc"
                ],
                "spl_set_id": [
                    "52c67ae0-707c-851b-e063-6294a90afda4"
                ],
                "package_ndc": [
                    "85237-1784-0",
                    "85237-1784-1",
                    "85237-1784-2",
                    "85237-1784-4",
                    "85237-1784-5",
                    "85237-1784-7"
                ],
                "original_packager_product_ndc": [
                    "0573-0164"
                ],
                "upc": [
                    "0655708117842",
                    "0655708017807",
                    "0655708217849",
                    "0655708017845"
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "4OD433S209",
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "Advil Sinus Congestion and Pain Relief IBUPROFEN, PHENYLEPHRINE HYDROCHLORIDE ACESULFAME POTASSIUM CARNAUBA WAX SILICON DIOXIDE STARCH, CORN CROSCARMELLOSE SODIUM GLYCERIN HYPROMELLOSE, UNSPECIFIED LACTIC ACID MALTODEXTRIN MEDIUM-CHAIN TRIGLYCERIDES MICROCRYSTALLINE CELLULOSE POLYDEXTROSE POLYVINYL ALCOHOL, UNSPECIFIED PROPYL GALLATE SODIUM LAURYL SULFATE STEARIC ACID SUCRALOSE TALC TITANIUM DIOXIDE TRIACETIN XANTHAN GUM IBUPROFEN IBUPROFEN PHENYLEPHRINE HYDROCHLORIDE PHENYLEPHRINE tan 1200;P10"
            ],
            "spl_unclassified_section": [
                "Drug Facts",
                "Other information • store at 20-25°C (68-77°F) • avoid excessive heat above 40°C (104°F). • read all warnings and directions before use. Keep carton."
            ],
            "active_ingredient": [
                "Active ingredient (in each tablet) Ibuprofen 200 mg (NSAID)* Phenylephrine HCl 10 mg *nonsteroidal anti-inflammatory drug Purpose Pain reliever/fever reducer Nasal decongestant"
            ],
            "purpose": [
                "Purpose Pain reliever/fever reducer Nasal decongestant"
            ],
            "indications_and_usage": [
                "Uses • temporarily relieves these symptoms associated with the common cold or flu: • headache • fever • sinus pressure • nasal congestion • minor body aches and pains • reduces swelling of the nasal passages • temporarily restores freer breathing through the nose"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: • hives • facial swelling • asthma (wheezing) • shock • rash • skin reddening • blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you: • are age 60 or older • have had stomach ulcers or bleeding problems • take a blood thinning (anticoagulant) or steroid drug • take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] • have 3 or more alcoholic drinks every day while using this product • take more or for a longer time than directed Do not use • in children under 12 years of age because this product contains too much medication for children under this age • if you have ever had an allergic reaction to any other pain reliever/fever reducer • right before or after heart surgery • if you are now taking a prescription monoamine oxidase inhibitor (MAOI) (certain drugs for depression, psychiatric, or emotional conditions, or Parkinson's disease), or for 2 weeks after stopping the MAOI drug. If you do not know if your prescription drug contains an MAOI, ask a doctor or pharmacist before taking this product Ask a doctor before use if • stomach bleeding warning applies to you • you have problems or serious side effects from taking pain relievers or fever reducers • you have a history of stomach problems, such as heartburn • you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, thyroid disease, diabetes or have trouble urinating due to an enlarged prostate gland • you are taking a diuretic Ask a doctor or pharmacist before use if you are • under a doctor's care for any serious condition • taking any other product that contains phenylephrine or any other nasal decongestant • taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin • taking any other drug When using this product • take with food or milk if stomach upset occurs • the risk of heart attack or stroke may increase if you use more than directed or for longer than directed Stop use and ask a doctor if • you experience any of the following signs of stomach bleeding: • feel faint • vomit blood • have bloody or black stools • have stomach pain that does not get better • pain gets worse or lasts more than 7 days • fever gets worse or lasts more than 3 days • nasal congestion lasts for more than 7 days • symptoms continue or get worse • redness or swelling is present in the painful area • you get nervous, dizzy, or sleepless • any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen during the last 3 months of pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use • in children under 12 years of age because this product contains too much medication for children under this age • if you have ever had an allergic reaction to any other pain reliever/fever reducer • right before or after heart surgery • if you are now taking a prescription monoamine oxidase inhibitor (MAOI) (certain drugs for depression, psychiatric, or emotional conditions, or Parkinson's disease), or for 2 weeks after stopping the MAOI drug. If you do not know if your prescription drug contains an MAOI, ask a doctor or pharmacist before taking this product"
            ],
            "ask_doctor": [
                "Ask a doctor before use if • stomach bleeding warning applies to you • you have problems or serious side effects from taking pain relievers or fever reducers • you have a history of stomach problems, such as heartburn • you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, thyroid disease, diabetes or have trouble urinating due to an enlarged prostate gland • you are taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are • under a doctor's care for any serious condition • taking any other product that contains phenylephrine or any other nasal decongestant • taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin • taking any other drug"
            ],
            "when_using": [
                "When using this product • take with food or milk if stomach upset occurs • the risk of heart attack or stroke may increase if you use more than directed or for longer than directed"
            ],
            "stop_use": [
                "Stop use and ask a doctor if • you experience any of the following signs of stomach bleeding: • feel faint • vomit blood • have bloody or black stools • have stomach pain that does not get better • pain gets worse or lasts more than 7 days • fever gets worse or lasts more than 3 days • nasal congestion lasts for more than 7 days • symptoms continue or get worse • redness or swelling is present in the painful area • you get nervous, dizzy, or sleepless • any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen during the last 3 months of pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions • do not take more than directed • adults and children 12 years of age and over: • take 1 tablet every 4 hours while symptoms persist • do not use more than 6 tablets in any 24-hour period unless directed by a doctor • children under 12 years of age: do not use because this product contains too much medication for children under this age"
            ],
            "inactive_ingredient": [
                "Inactive ingredients acesulfame potassium, artificial flavor, carnauba wax, colloidal silicon dioxide, corn starch, croscarmellose sodium, glycerin, hypromellose, lactic acid, lecithin, maltodextrin, medium-chain triglycerides, microcrystalline cellulose, pharmaceutical ink, polydextrose, polyvinyl alcohol, pregelatinized starch, propyl gallate, sodium lauryl sulfate, stearic acid, sucralose, synthetic iron oxide, talc, titanium dioxide, triacetin, xanthan gum"
            ],
            "questions": [
                "Questions or comments? Call weekdays from 9 AM to 5 PM EST toll free at 1-800-88-ADVIL"
            ],
            "package_label_principal_display_panel": [
                "Package Labeling: Advil Sinus"
            ],
            "set_id": "531abadc-37fd-4953-95bc-a211a2ba6914",
            "id": "f6f7501a-9ba4-82ea-e053-6294a90a298e",
            "effective_time": "20230315",
            "version": "3",
            "openfda": {
                "application_number": [
                    "NDA022565"
                ],
                "brand_name": [
                    "Advil Sinus Congestion and Pain Relief"
                ],
                "generic_name": [
                    "IBUPROFEN, PHENYLEPHRINE HYDROCHLORIDE"
                ],
                "manufacturer_name": [
                    "Navajo Manufacturing Company Inc."
                ],
                "product_ndc": [
                    "67751-150"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN",
                    "PHENYLEPHRINE HYDROCHLORIDE"
                ],
                "rxcui": [
                    "1369775"
                ],
                "spl_id": [
                    "f6f7501a-9ba4-82ea-e053-6294a90a298e"
                ],
                "spl_set_id": [
                    "531abadc-37fd-4953-95bc-a211a2ba6914"
                ],
                "package_ndc": [
                    "67751-150-01",
                    "67751-150-02"
                ],
                "original_packager_product_ndc": [
                    "0573-0199"
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM",
                    "04JA59TNSJ"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "ADVIL DUAL ACTION WITH ACETAMINOPHEN Ibuprofen, Acetaminophen CARNAUBA WAX SILICON DIOXIDE CROSCARMELLOSE SODIUM FERRIC OXIDE RED GLYCERYL DIBEHENATE HYPROMELLOSE, UNSPECIFIED POLYDEXTROSE POLYETHYLENE GLYCOL, UNSPECIFIED STARCH, CORN TITANIUM DIOXIDE IBUPROFEN IBUPROFEN ACETAMINOPHEN ACETAMINOPHEN Advil;II"
            ],
            "active_ingredient": [
                "Active ingredients (in each caplet) Acetaminophen 250 mg Ibuprofen 125 mg (NSAID*) *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purposes Pain reliever Pain reliever"
            ],
            "indications_and_usage": [
                "Uses temporarily relieves minor aches and pains due to: headache toothache backache menstrual cramps muscular aches minor pain of arthritis"
            ],
            "warnings": [
                "Warnings Acetaminophen liver damage warning: This product contains acetaminophen. Severe liver damage may occur if you take: with other drugs containing acetaminophen more than 6 caplets in 24 hours, which is the maximum daily amount for this product 3 or more alcoholic drinks every day while using this product Acetaminophen allergy alert: may cause severe skin reactions. Symptoms may include: skin reddening blisters rash If skin reaction occurs, stop use and seek medical help right away. NSAID allergy alert: ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. NSAID stomach bleeding warning This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you: are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attack and stroke warning: NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use with any other drug containing acetaminophen (prescription or nonprescription). If you are not sure whether a drug contains acetaminophen, ask a doctor or pharmacist if you have ever had an allergic reaction to acetaminophen or any other pain reliever right before or after heart surgery Ask a doctor before use if you have liver disease stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product take with food or milk if stomach upset occurs Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days redness or swelling is present in the painful area any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away. Prompt medical attention is critical for adults as well as for children even if you do not notice any signs or symptoms."
            ],
            "do_not_use": [
                "Do not use with any other drug containing acetaminophen (prescription or nonprescription). If you are not sure whether a drug contains acetaminophen, ask a doctor or pharmacist if you have ever had an allergic reaction to acetaminophen or any other pain reliever right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if you have liver disease stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days redness or swelling is present in the painful area any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away. Prompt medical attention is critical for adults as well as for children even if you do not notice any signs or symptoms."
            ],
            "dosage_and_administration": [
                "Directions do not take more than directed adults and children 12 years and over take 2 caplets every 8 hours while symptoms persist children under 12 years ask a doctor do not take more than 6 caplets in 24 hours, unless directed by a doctor"
            ],
            "dosage_and_administration_table": [
                "<table width=\"58.46%\"><col width=\"28%\"/><col width=\"30%\"/><tbody><tr><td styleCode=\"Rrule Botrule Lrule Toprule \" valign=\"top\"><paragraph>adults and children</paragraph><paragraph>12 years and over</paragraph></td><td styleCode=\"Rrule Botrule Toprule \" valign=\"top\"><list listType=\"unordered\"><item><content styleCode=\"bold\">take 2 caplets every 8 hours</content>while symptoms persist </item></list></td></tr><tr><td styleCode=\"Rrule Botrule Lrule \" valign=\"top\"><paragraph>children under 12 years</paragraph></td><td styleCode=\"Rrule Botrule \" valign=\"top\"><list listType=\"unordered\"><item>ask a doctor</item></list></td></tr></tbody></table>"
            ],
            "storage_and_handling": [
                "Other information read all warnings and directions before use. Keep carton. store at 20-25°C (68-77°F) avoid excessive heat above 40°C (104°F)"
            ],
            "inactive_ingredient": [
                "Inactive ingredients carnauba wax, colloidal silicon dioxide, croscarmellose sodium, ferric oxides, glyceryl dibehenate, hypromellose, pharmaceutical ink, polydextrose, polyethylene glycol, pregelatinized starch, titanium dioxide"
            ],
            "questions": [
                "Questions or comments? call weekdays 9 AM to 5 PM at 1-800-88-ADVIL"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL 1886-1 1886-6"
            ],
            "set_id": "55cd65fc-91bf-4979-e063-6294a90ab9b7",
            "id": "55cd6613-74f5-3d01-e063-6294a90a6cca",
            "effective_time": "20260704",
            "version": "1",
            "openfda": {
                "application_number": [
                    "NDA211733"
                ],
                "brand_name": [
                    "ADVIL DUAL ACTION WITH ACETAMINOPHEN"
                ],
                "generic_name": [
                    "IBUPROFEN, ACETAMINOPHEN"
                ],
                "manufacturer_name": [
                    "Select Consumer Group"
                ],
                "product_ndc": [
                    "85237-1886"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN",
                    "ACETAMINOPHEN"
                ],
                "rxcui": [
                    "2387532"
                ],
                "spl_id": [
                    "55cd6613-74f5-3d01-e063-6294a90a6cca"
                ],
                "spl_set_id": [
                    "55cd65fc-91bf-4979-e063-6294a90ab9b7"
                ],
                "package_ndc": [
                    "85237-1886-0",
                    "85237-1886-1",
                    "85237-1886-2",
                    "85237-1886-7",
                    "85237-1886-4",
                    "85237-1886-6"
                ],
                "original_packager_product_ndc": [
                    "0573-0147"
                ],
                "upc": [
                    "0655708018866",
                    "0655708118863"
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM",
                    "362O9ITL9D"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "Advil ibuprofen sodium ACESULFAME POTASSIUM CARAMEL CARNAUBA WAX SILICON DIOXIDE COPOVIDONE K25-31 FERRIC OXIDE RED HYPROMELLOSE, UNSPECIFIED MANNITOL MEDIUM-CHAIN TRIGLYCERIDES MICROCRYSTALLINE CELLULOSE POLYETHYLENE GLYCOL, UNSPECIFIED PROPYLENE GLYCOL SODIUM LAURYL SULFATE SUCRALOSE TITANIUM DIOXIDE IBUPROFEN SODIUM IBUPROFEN beige Advil;asymmetrical;underline Advil ibuprofen sodium ACESULFAME POTASSIUM CARAMEL CARNAUBA WAX SILICON DIOXIDE COPOVIDONE K25-31 FERRIC OXIDE RED HYPROMELLOSE, UNSPECIFIED MANNITOL MEDIUM-CHAIN TRIGLYCERIDES MICROCRYSTALLINE CELLULOSE POLYETHYLENE GLYCOL, UNSPECIFIED PROPYLENE GLYCOL SODIUM LAURYL SULFATE SUCRALOSE TITANIUM DIOXIDE IBUPROFEN SODIUM IBUPROFEN beige Advil;asymmetrical;underline"
            ],
            "active_ingredient": [
                "Active ingredient (in each tablet) Ibuprofen 200 mg (provided as ibuprofen sodium 256 mg) (NSAID)* *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purpose Pain reliever/ Fever reducer"
            ],
            "indications_and_usage": [
                "Uses temporarily relieves minor aches and pains due to: headache toothache backache menstrual cramps the common cold muscular aches minor pain of arthritis temporarily reduces fever"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you: are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attack and stroke warning NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product take with food or milk if stomach upset occurs Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days fever gets worse or lasts more than 3 days redness or swelling is present in the painful area any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days fever gets worse or lasts more than 3 days redness or swelling is present in the painful area any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 tablet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 tablet, 2 tablets may be used do not exceed 6 tablets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor"
            ],
            "storage_and_handling": [
                "Other information each tablet contains: sodium 22 mg read all warnings and directions before use. store at 20-25°C (68-77°F) avoid excessive heat above 40°C (104°F)"
            ],
            "inactive_ingredient": [
                "Inactive ingredients acesulfame potassium, caramel color, carnauba wax, colloidal silicon dioxide, copovidone, ferric oxide, hypromellose, mannitol, medium-chain triglycerides, microcrystalline cellulose, natural and artificial flavor, pharmaceutical ink, polyethylene glycol, propylene glycol, sodium lauryl sulfate, sucralose, titanium dioxide"
            ],
            "questions": [
                "Questions or comments? Call weekdays 9 AM to 5 PM EST at 1-800-88-ADVIL"
            ],
            "spl_unclassified_section": [
                "Additional Information Do Not Use if the sealed child resistant pouch is broken or torn. For most recent product information, visit www.Advil.com"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL Advil FILM-COATED IBUPROFEN SODIUM Ibuprofen Tablets, 200 mg (Provided as Ibuprofen Sodium 256 mg) Pain Reliever / Fever Reducer (NSAID) Advil Tablets Headache Muscular Aches Minor Pain of Arthritis Menstrual Cramps Toothache Fever See Full Drug Facts information on the back of this dispenser 100 TABLETS (50 PACKETS of 2 TABLETS EACH) 000068427 Front Carton Advil Ibuprofen Tablets 100 ct",
                "PRINCIPAL DISPLAY PANEL Advil ® 20 FREE TABLETS Ibuprofen Tablets, 200 mg (Provided as Ibuprofen Sodium 256 mg) Pain Reliever / Fever Reducer (NSAID) FILM-COATED IBUPROFEN SODIUM Advil Tablets 100 Tablets Advil Ibuprofen Tablets 100 ct"
            ],
            "set_id": "5be198b8-396e-4b44-8819-e2e3b5d2ad0e",
            "id": "40429ef4-846a-eb4c-e063-6394a90ab7a9",
            "effective_time": "20251003",
            "version": "20",
            "openfda": {
                "application_number": [
                    "NDA201803"
                ],
                "brand_name": [
                    "Advil"
                ],
                "generic_name": [
                    "IBUPROFEN SODIUM"
                ],
                "manufacturer_name": [
                    "Haleon US Holdings LLC"
                ],
                "product_ndc": [
                    "0573-0133",
                    "0573-0134"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN SODIUM"
                ],
                "rxcui": [
                    "153008",
                    "310965"
                ],
                "spl_id": [
                    "40429ef4-846a-eb4c-e063-6394a90ab7a9"
                ],
                "spl_set_id": [
                    "5be198b8-396e-4b44-8819-e2e3b5d2ad0e"
                ],
                "package_ndc": [
                    "0573-0133-20",
                    "0573-0133-40",
                    "0573-0133-80",
                    "0573-0133-02",
                    "0573-0133-04",
                    "0573-0133-89",
                    "0573-0133-81",
                    "0573-0133-05",
                    "0573-0133-88",
                    "0573-0133-41",
                    "0573-0133-91",
                    "0573-0133-01",
                    "0573-0134-20",
                    "0573-0134-80"
                ],
                "is_original_packager": [
                    true
                ],
                "unii": [
                    "RM1CE97Z4N"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "JUNIOR STRENGTH ADVIL ibuprofen IBUPROFEN IBUPROFEN DIACETYLATED MONOGLYCERIDES CARNAUBA WAX SILICON DIOXIDE STARCH, CORN CROSCARMELLOSE SODIUM METHYLPARABEN MICROCRYSTALLINE CELLULOSE SHELLAC POVIDONE, UNSPECIFIED PROPYLPARABEN SODIUM BENZOATE STEARIC ACID SUCROSE FERRIC OXIDE RED TITANIUM DIOXIDE tan round tablet Advil;100"
            ],
            "active_ingredient": [
                "ACTIVE INGREDIENT (IN EACH TABLET) Ibuprofen 100 mg (NSAID)* *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "PURPOSE Fever reducer/Pain reliever"
            ],
            "indications_and_usage": [
                "USES temporarily: • reduces fever • relieves minor aches and pains due to the common cold, flu, sore throat, headaches and toothaches"
            ],
            "warnings": [
                "WARNINGS Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: • hives • facial swelling • asthma (wheezing) • shock • skin reddening • rash • blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if the child • has had stomach ulcers or bleeding problems • takes a blood thinning (anticoagulant) or steroid drug • takes other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] • takes more or for a longer time than directed Heart attack and stroke warning NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Sore throat warning: Severe or persistent sore throat or sore throat accompanied by high fever, headache, nausea, and vomiting may be serious. Consult doctor promptly. Do not use more than 2 days or administer to children under 3 years of age unless directed by doctor. Do not use • if the child has ever had an allergic reaction to any other pain reliever/fever reducer • right before or after heart surgery Ask a doctor before use if • stomach bleeding warning applies to the child • child has problems or serious side effects from taking pain relievers or fever reducers • child has a history of stomach problems, such as heartburn • child has high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke • child has not been drinking fluids • child has lost a lot of fluid due to vomiting or diarrhea • child is taking a diuretic Ask a doctor or pharmacist before use if the child is • under a doctor's care for any serious condition • taking any other drug When using this product • take with food or milk if stomach upset occurs Stop use and ask a doctor if • child experiences any of the following signs of stomach bleeding: • feels faint • vomits blood • has bloody or black stools • has stomach pain that does not get better • child has symptoms of heart problems or stroke: • chest pain • trouble breathing • weakness in one part or side of body • slurred speech • leg swelling • child does not get any relief within first day (24 hours) of treatment • fever or pain gets worse or lasts more than 3 days • redness or swelling is present in the painful area • any new symptoms appear Keep out of reach of children In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use • if the child has ever had an allergic reaction to any other pain reliever/fever reducer • right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if • stomach bleeding warning applies to the child • child has problems or serious side effects from taking pain relievers or fever reducers • child has a history of stomach problems, such as heartburn • child has high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke • child has not been drinking fluids • child has lost a lot of fluid due to vomiting or diarrhea • child is taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if the child is • under a doctor's care for any serious condition • taking any other drug"
            ],
            "when_using": [
                "When using this product • take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if • child experiences any of the following signs of stomach bleeding: • feels faint • vomits blood • has bloody or black stools • has stomach pain that does not get better • child has symptoms of heart problems or stroke: • chest pain • trouble breathing • weakness in one part or side of body • slurred speech • leg swelling • child does not get any relief within first day (24 hours) of treatment • fever or pain gets worse or lasts more than 3 days • redness or swelling is present in the painful area • any new symptoms appear"
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "DIRECTIONS • this product does not contain directions or complete warnings for adult use • do not give more than directed • find right dose on chart below. If possible, use weight to dose; otherwise use age. • repeat dose every 6-8 hours , if needed • do not use more than 4 times a day Dosing Chart Weight (lb) Age (yr) Dose (tablets) under 48 lb under 6 yr ask a doctor 48-71 lb 6-10 yr 2 tablets 72-95 lb 11 yr 3 tablets"
            ],
            "dosage_and_administration_table": [
                "<table ID=\"_RefID0EABAE\" width=\"80%\"><caption>Dosing Chart</caption><col width=\"27%\"/><col width=\"27%\"/><col width=\"27%\"/><thead><tr><th align=\"left\" styleCode=\"Botrule Lrule Toprule \" valign=\"top\"><content styleCode=\"bold\">Weight (lb)</content></th><th align=\"left\" styleCode=\"Botrule Toprule \" valign=\"top\"><content styleCode=\"bold\">Age (yr)</content></th><th align=\"left\" styleCode=\"Rrule Botrule Toprule \" valign=\"top\"><content styleCode=\"bold\">Dose (tablets)</content></th></tr></thead><tbody><tr><td styleCode=\"Lrule Toprule Botrule \" valign=\"top\"><paragraph>under 48 lb</paragraph></td><td styleCode=\"Toprule Botrule \" valign=\"top\"><paragraph>under 6 yr</paragraph></td><td styleCode=\"Rrule Toprule Botrule \" valign=\"top\"><paragraph>ask a doctor</paragraph></td></tr><tr><td styleCode=\"Lrule Botrule \" valign=\"top\"><paragraph>48-71 lb</paragraph></td><td styleCode=\"Botrule \" valign=\"top\"><paragraph>6-10 yr</paragraph></td><td styleCode=\"Rrule Botrule \" valign=\"top\"><paragraph>2 tablets</paragraph></td></tr><tr><td styleCode=\"Botrule Lrule \" valign=\"top\"><paragraph>72-95 lb</paragraph></td><td styleCode=\"Botrule \" valign=\"top\"><paragraph>11 yr</paragraph></td><td styleCode=\"Rrule Botrule \" valign=\"top\"><paragraph>3 tablets</paragraph></td></tr></tbody></table>"
            ],
            "spl_unclassified_section": [
                "OTHER INFORMATION • one dose lasts 6-8 hours • store at 20-25°C (68-77°F) • avoid excessive heat above 40°C (104°F) • see side of box for lot number and expiration date"
            ],
            "inactive_ingredient": [
                "INACTIVE INGREDIENTS acetylated monoglycerides, carnauba wax, colloidal silicon dioxide, corn starch, croscarmellose sodium, methylparaben, microcrystalline cellulose, pharmaceutical glaze, pharmaceutical ink, povidone, pregelatinized starch, propylparaben, sodium benzoate, stearic acid, sucrose, synthetic iron oxides, titanium dioxide"
            ],
            "questions": [
                "QUESTIONS OR COMMENTS? call toll free 1-800-88-ADVIL or ask your pharmacist, doctor or health care professional"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL Junior Strength Advil ® Ibuprofen Tablets, 100 mg Pain Reliever/Fever Reducer (NSAID) Fever Aches & Pains Lasts Up To 8 Hours for ages 6-11 years 24 COATED TABLETS PRINCIPAL DISPLAY PANEL - 100 mg Tablet Bottle Carton"
            ],
            "set_id": "5ed0d404-c54d-b05f-578a-d2730e8a78ee",
            "id": "ef08fcca-c3f3-4179-a042-bbd9f6733e58",
            "effective_time": "20240422",
            "version": "7",
            "openfda": {
                "application_number": [
                    "NDA020267"
                ],
                "brand_name": [
                    "JUNIOR STRENGTH ADVIL"
                ],
                "generic_name": [
                    "IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Haleon US Holdings LLC"
                ],
                "product_ndc": [
                    "0573-0175"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN"
                ],
                "rxcui": [
                    "198405",
                    "731535"
                ],
                "spl_id": [
                    "ef08fcca-c3f3-4179-a042-bbd9f6733e58"
                ],
                "spl_set_id": [
                    "5ed0d404-c54d-b05f-578a-d2730e8a78ee"
                ],
                "package_ndc": [
                    "0573-0175-11"
                ],
                "is_original_packager": [
                    true
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "ADVIL PM diphenhydramine citrate and ibuprofen CALCIUM STEARATE CARNAUBA WAX SILICON DIOXIDE STARCH, CORN CROSCARMELLOSE SODIUM FD&C BLUE NO. 2 GLYCERYL DIBEHENATE HYPROMELLOSE, UNSPECIFIED LACTOSE MONOHYDRATE MICROCRYSTALLINE CELLULOSE POLYDEXTROSE POLYETHYLENE GLYCOL, UNSPECIFIED SODIUM LAURYL SULFATE SODIUM STARCH GLYCOLATE TYPE A POTATO STEARIC ACID TITANIUM DIOXIDE DIPHENHYDRAMINE CITRATE DIPHENHYDRAMINE IBUPROFEN IBUPROFEN blue Advil;PM"
            ],
            "active_ingredient": [
                "Active ingredients (in each caplet) Diphenhydramine citrate 38 mg Ibuprofen 200 mg (NSAID)* *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purposes Nighttime sleep-aid Pain reliever"
            ],
            "indications_and_usage": [
                "Uses for relief of occasional sleeplessness when associated with minor aches and pains helps you fall asleep and stay asleep"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attack and stroke warning: NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer unless you have time for a full night's sleep in children under 12 years of age right before or after heart surgery with any other product containing diphenhydramine, even one used on skin if you have sleeplessness without pain Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic you have a breathing problem such as emphysema or chronic bronchitis you have glaucoma you have trouble urinating due to an enlarged prostate gland Ask a doctor or pharmacist before use if you are taking sedatives or tranquilizers, or any other sleep-aid under a doctor's care for any continuing medical illness taking any other antihistamines taking aspirin for heart attack or stroke because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product drowsiness will occur avoid alcoholic drinks do not drive a motor vehicle or operate machinery take with food or milk if stomach upset occurs Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days sleeplessness persists continuously for more than 2 weeks. Insomnia may be a symptom of a serious underlying medical illness. redness or swelling is present in the painful area any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer unless you have time for a full night's sleep in children under 12 years of age right before or after heart surgery with any other product containing diphenhydramine, even one used on skin if you have sleeplessness without pain"
            ],
            "ask_doctor": [
                "Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic you have a breathing problem such as emphysema or chronic bronchitis you have glaucoma you have trouble urinating due to an enlarged prostate gland"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are taking sedatives or tranquilizers, or any other sleep-aid under a doctor's care for any continuing medical illness taking any other antihistamines taking aspirin for heart attack or stroke because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product drowsiness will occur avoid alcoholic drinks do not drive a motor vehicle or operate machinery take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days sleeplessness persists continuously for more than 2 weeks. Insomnia may be a symptom of a serious underlying medical illness. redness or swelling is present in the painful area any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions do not take more than directed adults and children 12 years and over: take 2 caplets at bedtime do not take more than 2 caplets in 24 hours"
            ],
            "spl_unclassified_section": [
                "Other ingredients read all warnings and directions before use. Keep carton. store at 20-25°C (68-77°F) avoid excessive heat above 40°C (104°F)",
                "Additional Information Do Not Use if seal under bottle cap imprinted with “SEALED for YOUR PROTECTION” is broken or missing. For most recent product information, visit www.Advil.com. Distributed by: GSK Consumer Healthcare, Warren, NJ 07059 ©2021 GSK or licensor Trademarks owned or licensed by GSK"
            ],
            "inactive_ingredient": [
                "Inactive ingredients calcium stearate, carnauba wax, colloidal silicon dioxide, corn starch, croscarmellose sodium, FD&C blue no. 2 aluminum lake, glyceryl dibehenate, hypromellose, lactose monohydrate, microcrystalline cellulose, pharmaceutical ink, polydextrose, polyethylene glycol, pregelatinized starch, sodium lauryl sulfate, sodium starch glycolate, stearic acid, titanium dioxide"
            ],
            "questions": [
                "Questions or Comments? Call weekdays 9 AM to 5 PM EST at 1-800-88-ADVIL"
            ],
            "package_label_principal_display_panel": [
                "Principal Display Panel NDC 0573-0164-20 Advil PM Ibuprofen, 200 mg / Diphenhydramine citrate, 38 mg Pain Reliever (NSAID) / Nighttime Sleep-Aid 20 Coated Caplets* *Capsule-Shaped Tablets Advil PM 20 Coated Caplets"
            ],
            "set_id": "658fc201-47c9-6a6d-8af9-6208298d43b4",
            "id": "15971707-84cd-4742-e063-6394a90af906",
            "effective_time": "20240408",
            "version": "21",
            "openfda": {
                "application_number": [
                    "NDA021394"
                ],
                "brand_name": [
                    "ADVIL PM"
                ],
                "generic_name": [
                    "DIPHENHYDRAMINE CITRATE AND IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Haleon US Holdings LLC"
                ],
                "product_ndc": [
                    "0573-0164"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "DIPHENHYDRAMINE CITRATE",
                    "IBUPROFEN"
                ],
                "rxcui": [
                    "895664"
                ],
                "spl_id": [
                    "15971707-84cd-4742-e063-6394a90af906"
                ],
                "spl_set_id": [
                    "658fc201-47c9-6a6d-8af9-6208298d43b4"
                ],
                "package_ndc": [
                    "0573-0164-33",
                    "0573-0164-04",
                    "0573-0164-20",
                    "0573-0164-30",
                    "0573-0164-40",
                    "0573-0164-43",
                    "0573-0164-45",
                    "0573-0164-32",
                    "0573-0164-41",
                    "0573-0164-91",
                    "0573-0164-05",
                    "0573-0164-55",
                    "0573-0164-21",
                    "0573-0164-44",
                    "0573-0164-14",
                    "0573-0164-12",
                    "0573-0164-49",
                    "0573-0164-46",
                    "0573-0164-65",
                    "0573-0164-08",
                    "0573-0164-09"
                ],
                "is_original_packager": [
                    true
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "4OD433S209",
                    "WK2XYI10QM"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "Advil Multi-Symptom Cold and Flu chlorpheniramine maleate, ibuprofen, phenylephrine HCl ACESULFAME POTASSIUM CARNAUBA WAX SILICON DIOXIDE CROSCARMELLOSE SODIUM GLYCERIN GLYCERYL DIBEHENATE HYPROMELLOSE, UNSPECIFIED LACTIC ACID, UNSPECIFIED FORM SOYBEAN LECITHIN MALTODEXTRIN MEDIUM-CHAIN TRIGLYCERIDES MICROCRYSTALLINE CELLULOSE POLYDEXTROSE POLYVINYL ALCOHOL, UNSPECIFIED PROPYL GALLATE SUCRALOSE TALC TITANIUM DIOXIDE TRIACETIN XANTHAN GUM STARCH, CORN FERRIC OXIDE RED CHLORPHENIRAMINE MALEATE CHLORPHENIRAMINE IBUPROFEN IBUPROFEN PHENYLEPHRINE HYDROCHLORIDE PHENYLEPHRINE Advil;CF"
            ],
            "active_ingredient": [
                "Active ingredients (in each tablet) Chlorpheniramine maleate 4 mg Ibuprofen 200 mg (NSAID)* Phenylephrine HCl 10 mg *nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purposes Antihistamine Pain reliever/Fever reducer Nasal decongestant"
            ],
            "indications_and_usage": [
                "Uses temporarily relieves these symptoms associated with the common cold or flu: headache fever minor body aches and pains nasal congestion runny nose sinus pressure sneezing reduces swelling of the nasal passages temporarily restores freer breathing through the nose"
            ],
            "warnings": [
                "Warnings Allergy alert: Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning: This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you: are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attack and stroke warning: NSAIDs, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use in children under 12 years of age if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery if you are now taking a prescription monoamine oxidase inhibitor (MAOI) (certain drugs for depression, psychiatric, or emotional conditions, or Parkinson's disease), or for 2 weeks after stopping the MAOI drug. If you do not know if your prescription drug contains an MAOI, ask a doctor or pharmacist before taking this product. Ask a doctor before use if you have a breathing problem such as emphysema or chronic bronchitis stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, thyroid disease, diabetes, glaucoma, have trouble urinating due to an enlarged prostate gland, or had a stroke you are taking a diuretic Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking sedatives or tranquilizers taking any other product that contains phenylephrine, chlorpheniramine or any other nasal decongestant or antihistamine taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product take with food or milk if stomach upset occurs avoid alcoholic drinks be careful when driving a motor vehicle or operating machinery drowsiness may occur alcohol, sedatives, and tranquilizers may increase drowsiness may cause excitability especially in children Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 7 days fever gets worse or lasts more than 3 days nasal congestion lasts for more than 7 days redness or swelling is present in the painful area you get nervous, dizzy, or sleepless symptoms continue or get worse any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use in children under 12 years of age if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery if you are now taking a prescription monoamine oxidase inhibitor (MAOI) (certain drugs for depression, psychiatric, or emotional conditions, or Parkinson's disease), or for 2 weeks after stopping the MAOI drug. If you do not know if your prescription drug contains an MAOI, ask a doctor or pharmacist before taking this product."
            ],
            "ask_doctor": [
                "Ask a doctor before use if you have a breathing problem such as emphysema or chronic bronchitis stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, thyroid disease, diabetes, glaucoma, have trouble urinating due to an enlarged prostate gland, or had a stroke you are taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking sedatives or tranquilizers taking any other product that contains phenylephrine, chlorpheniramine or any other nasal decongestant or antihistamine taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product take with food or milk if stomach upset occurs avoid alcoholic drinks be careful when driving a motor vehicle or operating machinery drowsiness may occur alcohol, sedatives, and tranquilizers may increase drowsiness may cause excitability especially in children"
            ],
            "stop_use": [
                "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 7 days fever gets worse or lasts more than 3 days nasal congestion lasts for more than 7 days redness or swelling is present in the painful area you get nervous, dizzy, or sleepless symptoms continue or get worse any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions do not take more than directed adults and children 12 years of age and over: take 1 tablet every 4 hours while symptoms persist do not take more than 6 tablets in any 24-hour period, unless directed by a doctor children under 12 years of age: do not use"
            ],
            "storage_and_handling": [
                "Other information read all warnings and directions before use. Keep carton. store at 20-25°C (68-77°F) avoid excessive heat above 40°C (104°F)"
            ],
            "inactive_ingredient": [
                "Inactive ingredients acesulfame potassium, artificial flavors, carnauba wax, colloidal silicon dioxide, corn starch, croscarmellose sodium, glycerin, glyceryl dibehenate, hypromellose, lactic acid, lecithin, maltodextrin, medium-chain triglycerides, microcrystalline cellulose, pharmaceutical ink, polydextrose, polyvinyl alcohol, pregelatinized starch, propyl gallate, silicon dioxide, sucralose, synthetic iron oxide, talc, titanium dioxide, triacetin, xanthan gum"
            ],
            "questions": [
                "Questions or comments? Call weekdays from 9 AM to 5 PM EST toll free at 1-800-88-ADVIL"
            ],
            "spl_unclassified_section": [
                "Additional Information READ AND KEEP CARTON FOR COMPLETE WARNINGS AND INFORMATION Product inside sealed in plastic blister with foil backing. Do Not Use if plastic blister or foil barrier is broken. Distributed by: GSK Consumer Healthcare, Warren, NJ 07059 For most recent product information, visit www.advil.com Trademarks owned or licensed by GSK ©2021 GSK or licensor"
            ],
            "package_label_principal_display_panel": [
                "PRINCIPAL DISPLAY PANEL Advil MULTI-SYMPTOM COLD & FLU Ibuprofen 200 mg Pain Reliever/Fever Reducer (NSAID) Phenylephrine HCl 10 mg Nasal Decongestant Chlorpheniramine Maleate 4 mg Antihistamine Headache Fever Body Aches Sinus Pressure Nasal Congestion Runny Nose Sneezing Nasal Swelling ONE TABLET DOSE! 30 Coated Tablets 000065883 Carton Advil MultiSymptom Cold & Flu 30 Coated Tablets"
            ],
            "set_id": "7671d104-3c5c-4f63-b6b1-6c91c22592f8",
            "id": "4042cf07-a239-1ae9-e063-6394a90acd01",
            "effective_time": "20251003",
            "version": "14",
            "openfda": {
                "application_number": [
                    "NDA022113"
                ],
                "brand_name": [
                    "Advil Multi-Symptom Cold and Flu"
                ],
                "generic_name": [
                    "CHLORPHENIRAMINE MALEATE, IBUPROFEN, PHENYLEPHRINE HCL"
                ],
                "manufacturer_name": [
                    "Haleon US Holdings LLC"
                ],
                "product_ndc": [
                    "0573-0190"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "CHLORPHENIRAMINE MALEATE",
                    "IBUPROFEN",
                    "PHENYLEPHRINE HYDROCHLORIDE"
                ],
                "rxcui": [
                    "1310503"
                ],
                "spl_id": [
                    "4042cf07-a239-1ae9-e063-6394a90acd01"
                ],
                "spl_set_id": [
                    "7671d104-3c5c-4f63-b6b1-6c91c22592f8"
                ],
                "package_ndc": [
                    "0573-0190-10",
                    "0573-0190-20",
                    "0573-0190-01",
                    "0573-0190-30",
                    "0573-0190-03",
                    "0573-0190-02"
                ],
                "is_original_packager": [
                    true
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "V1Q0O9OJ9Z",
                    "WK2XYI10QM",
                    "04JA59TNSJ"
                ]
            }
        },
        {
            "spl_product_data_elements": [
                "Advil Ibuprofen DIACETYLATED MONOGLYCERIDES SILICON DIOXIDE STARCH, CORN CROSCARMELLOSE SODIUM METHYLPARABEN MICROCRYSTALLINE CELLULOSE SHELLAC POVIDONE, UNSPECIFIED PROPYLPARABEN SODIUM BENZOATE SODIUM LAURYL SULFATE STEARIC ACID SUCROSE TITANIUM DIOXIDE WHITE WAX IBUPROFEN IBUPROFEN pinkish brown Smooth in texture w/ polish surface Advil Advil Ibuprofen DIACETYLATED MONOGLYCERIDES SILICON DIOXIDE STARCH, CORN CROSCARMELLOSE SODIUM METHYLPARABEN MICROCRYSTALLINE CELLULOSE SHELLAC POVIDONE, UNSPECIFIED PROPYLPARABEN SODIUM BENZOATE SODIUM LAURYL SULFATE STEARIC ACID SUCROSE TITANIUM DIOXIDE WHITE WAX IBUPROFEN IBUPROFEN pinkish brown Smooth in texture w/ polish surface Advil Advil Ibuprofen DIACETYLATED MONOGLYCERIDES SILICON DIOXIDE STARCH, CORN CROSCARMELLOSE SODIUM METHYLPARABEN MICROCRYSTALLINE CELLULOSE SHELLAC POVIDONE, UNSPECIFIED PROPYLPARABEN SODIUM BENZOATE SODIUM LAURYL SULFATE STEARIC ACID SUCROSE TITANIUM DIOXIDE WHITE WAX IBUPROFEN IBUPROFEN pinkish brown Smooth in texture w/ polish surface Advil"
            ],
            "spl_unclassified_section": [
                "Drug Facts",
                "Repackaged and distributed with permission of Pfizer Consumer Healthcare by: Lil' Drug Store Products, Inc., 1201 Continental Place NE, Cedar Rapids, IA 52402"
            ],
            "active_ingredient": [
                "Active ingredient (in each tablet) Ibuprofen 200 mg (NSAID) nonsteroidal anti-inflammatory drug"
            ],
            "purpose": [
                "Purpose Pain reliever/Fever reducer"
            ],
            "indications_and_usage": [
                "Uses temporarily relieves minor aches and pains due to: headache toothache backache menstrual cramps the common cold muscular aches minor pain of arthritis temporarily reduces fever"
            ],
            "warnings": [
                "Warnings Allergy alert Ibuprofen may cause a severe allergic reaction, especially in people allergic to aspirin. Symptoms may include: hives facial swelling asthma (wheezing) shock skin reddening rash blisters If an allergic reaction occurs, stop use and seek medical help right away. Stomach bleeding warning This product contains an NSAID, which may cause severe stomach bleeding. The chance is higher if you are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or nonprescription NSAIDs [aspirin, ibuprofen, naproxen, or others] have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Heart attack and stroke warning NSAIDS, except aspirin, increase the risk of heart attack, heart failure, and stroke. These can be fatal. The risk is higher if you use more than directed or for longer than directed. Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug When using this product take with food or milk if stomach upset occurs Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days fever gets worse or lasts more than 3 days redness or swelling is present in the painful area any new symptoms appear If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery. Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "do_not_use": [
                "Do not use if you have ever had an allergic reaction to any other pain reliever/fever reducer right before or after heart surgery"
            ],
            "ask_doctor": [
                "Ask a doctor before use if stomach bleeding warning applies to you you have problems or serious side effects from taking pain relievers or fever reducers you have a history of stomach problems, such as heartburn you have high blood pressure, heart disease, liver cirrhosis, kidney disease, asthma, or had a stroke you are taking a diuretic"
            ],
            "ask_doctor_or_pharmacist": [
                "Ask a doctor or pharmacist before use if you are under a doctor's care for any serious condition taking aspirin for heart attack or stroke, because ibuprofen may decrease this benefit of aspirin taking any other drug"
            ],
            "when_using": [
                "When using this product take with food or milk if stomach upset occurs"
            ],
            "stop_use": [
                "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding: feel faint vomit blood have bloody or black stools have stomach pain that does not get better you have symptoms of heart problems or stroke: chest pain trouble breathing weakness in one part or side of body slurred speech leg swelling pain gets worse or lasts more than 10 days fever gets worse or lasts more than 3 days redness or swelling is present in the painful area any new symptoms appear"
            ],
            "pregnancy_or_breast_feeding": [
                "If pregnant or breast-feeding, ask a health professional before use. It is especially important not to use ibuprofen at 20 weeks or later in pregnancy unless definitely directed to do so by a doctor because it may cause problems in the unborn child or complications during delivery."
            ],
            "keep_out_of_reach_of_children": [
                "Keep out of reach of children. In case of overdose, get medical help or contact a Poison Control Center right away."
            ],
            "dosage_and_administration": [
                "Directions do not take more than directed the smallest effective dose should be used adults and children 12 years and over: take 1 tablet every 4 to 6 hours while symptoms persist if pain or fever does not respond to 1 tablet, 2 tablets may be used do not exceed 6 tablets in 24 hours, unless directed by a doctor children under 12 years: ask a doctor"
            ],
            "storage_and_handling": [
                "Other information read all warnings and directions before use. Keep carton. store at 20-25°C (68-77°F) avoid excessive heat above 40°C (104°F)"
            ],
            "inactive_ingredient": [
                "Inactive ingredients acetylated monoglycerides, colloidal silicon dioxide, corn starch, croscarmellose sodium, methylparaben, microcrystalline cellulose, pharmaceutical glaze, pharmaceutical ink, povidone, pregelatinized starch, propylparaben, sodium benzoate, sodium lauryl sulfate, stearic acid, sucrose, synthetic iron oxide, titanium dioxide, white wax"
            ],
            "questions": [
                "Questions or comments? call toll free 1-800-88-ADVIL"
            ],
            "package_label_principal_display_panel": [
                "Lil' Drug Store Advil - PDP/Package Advil ® Ibuprofen Tablets, 200 mg Pain Reliever / Fever Reducer (NSAID) [tablet image] 6 Coated Tablets Lil' Drug Store ® PDP",
                "Travel BASIX Advil - PDP/Package Advil Ibuprofen Tablets, 200 mg Pain Reliever / Fever Reducer (NSAID) [tablet image] Tablets 4 Coated Tablets [Travel BASIX logo] PDP/Package",
                "CVP Health Advil - PDP/Package Advil Ibuprofen Tablets, 200 mg Pain Reliever / Fever Reducer (NSAID) [tablet image] Tablets 4 Coated Tablets [CVP ® Health logo] PDP/Package",
                "Advil 30pc Dispens-It Box, Lil' Drug Store ® Advil Ibuprofen Tablets, 200 mg Pain Reliever/Fever Reducer (NSAID) [tablet image] Tablets Headache Mainor Pain of Arthritis Toothache Muscular Aches Menstrual Cramps Fever See full Drug Facys information on the back of this dispenser 60 TABLETS (30 PACKETS OF 2 COATED TABLETS EACH) [Lil' Drug Store ® logo] PDP/Package"
            ],
            "set_id": "772360bd-8631-4d24-b4db-5a7e6e1d9a13",
            "id": "2cb6ac3b-ffe3-21bc-e063-6394a90a4569",
            "effective_time": "20250127",
            "version": "12",
            "openfda": {
                "application_number": [
                    "NDA018989"
                ],
                "brand_name": [
                    "Advil"
                ],
                "generic_name": [
                    "IBUPROFEN"
                ],
                "manufacturer_name": [
                    "Lil' Drug Store Products, Inc."
                ],
                "product_ndc": [
                    "66715-6434",
                    "66715-9700",
                    "66715-6500"
                ],
                "product_type": [
                    "HUMAN OTC DRUG"
                ],
                "route": [
                    "ORAL"
                ],
                "substance_name": [
                    "IBUPROFEN"
                ],
                "rxcui": [
                    "153008",
                    "310965"
                ],
                "spl_id": [
                    "2cb6ac3b-ffe3-21bc-e063-6394a90a4569"
                ],
                "spl_set_id": [
                    "772360bd-8631-4d24-b4db-5a7e6e1d9a13"
                ],
                "package_ndc": [
                    "66715-9700-1",
                    "66715-9700-2",
                    "66715-9700-3",
                    "66715-9700-8",
                    "66715-9700-7",
                    "66715-6500-2",
                    "66715-6434-2"
                ],
                "is_original_packager": [
                    true
                ],
                "nui": [
                    "N0000000160",
                    "M0001335",
                    "N0000175722"
                ],
                "pharm_class_moa": [
                    "Cyclooxygenase Inhibitors [MoA]"
                ],
                "pharm_class_cs": [
                    "Anti-Inflammatory Agents, Non-Steroidal [CS]"
                ],
                "pharm_class_epc": [
                    "Nonsteroidal Anti-inflammatory Drug [EPC]"
                ],
                "unii": [
                    "WK2XYI10QM"
                ]
            }
        }
    ]
}].map((m) => (<MedicineCard key={m.set_id} medicine={m} onSelect={setSelected}/>))}
        </div>
      </div>
  )
}

export default App
