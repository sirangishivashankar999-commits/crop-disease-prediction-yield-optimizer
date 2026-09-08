"""
CROPWISE AI - Crop Disease Detection Image Preprocessing Pipeline
Provides validation, tensor transformation, normalization, and agricultural knowledge enrichment.
"""

from typing import Tuple, Dict, Any, List
from PIL import Image
import torch
from torchvision import transforms

# Standard ImageNet normalization parameters for transfer learning
NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]
IMG_SIZE = 224

# Supported image formats
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

# 10 Standard Agricultural Disease Classes
DISEASE_CLASSES = [
    "Tomato_Early_Blight",
    "Tomato_Late_Blight",
    "Tomato_Healthy",
    "Potato_Early_Blight",
    "Potato_Late_Blight",
    "Potato_Healthy",
    "Corn_Leaf_Blight",
    "Corn_Healthy",
    "Rice_Leaf_Disease",
    "Rice_Healthy",
]

# Knowledge base for symptoms, severity, and treatments
DISEASE_ADVISORY: Dict[str, Dict[str, Any]] = {
    "Tomato_Early_Blight": {
        "display_name": "Tomato Early Blight",
        "crop": "Tomato",
        "default_severity": "Moderate",
        "symptoms": [
            "Brown to dark-brown circular lesions on older lower leaves",
            "Concentric rings producing a characteristic 'target-board' effect",
            "Surrounding chlorotic yellow halos on foliage",
            "Premature defoliation exposing fruit to sunscald"
        ],
        "treatment": [
            "Prune and safely destroy heavily infected lower foliage",
            "Apply copper-based fungicides or chlorothalonil according to local agronomic guidelines",
            "Avoid overhead sprinkler irrigation to minimize canopy moisture duration",
            "Sterilize pruning shears between rows with 70% isopropyl alcohol"
        ],
        "prevention": [
            "Maintain a 3-year crop rotation schedule away from Solanaceae crops",
            "Employ organic mulch around plant bases to prevent soil-splashing fungal spores",
            "Ensure 45-60 cm plant spacing for adequate air circulation",
            "Select resistant cultivars such as Mountain Supreme or Plum Regal"
        ]
    },
    "Tomato_Late_Blight": {
        "display_name": "Tomato Late Blight",
        "crop": "Tomato",
        "default_severity": "High",
        "symptoms": [
            "Large, irregular water-soaked pale-green to dark-brown lesions",
            "White velvety fungal sporulation on underside of leaves in humid conditions",
            "Rapid collapse of foliage, stems, and petiole blighting",
            "Greasy, dark-brown sunken lesions developing on green tomato fruit"
        ],
        "treatment": [
            "Immediately remove and bag all infected plants; do not compost infected tissue",
            "Apply targeted systemic fungicides such as mandipropamid, cymoxanil, or metalaxyl",
            "Eliminate nearby cull piles and volunteer tomato/potato weeds",
            "Notify neighboring growers of regional late blight spore outbreaks"
        ],
        "prevention": [
            "Plant certified disease-free transplants and certified seed",
            "Monitor regional late blight forecasting models and blight alert networks",
            "Utilize drip irrigation rather than sprinkler systems",
            "Grow tolerant varieties with Ph-2 and Ph-3 resistance genes"
        ]
    },
    "Tomato_Healthy": {
        "display_name": "Tomato Healthy",
        "crop": "Tomato",
        "default_severity": "None",
        "symptoms": [
            "Vibrant green leaf tissue with intact cell turgor",
            "Uniform leaf morphology without chlorosis, necrosis, or spotting",
            "Healthy vascular petioles and vigorous vegetative apex growth"
        ],
        "treatment": [
            "No disease intervention required",
            "Maintain regular balanced nitrogen-phosphorus-potassium fertigation program",
            "Monitor scouting traps for sap-sucking pests like whiteflies and aphids"
        ],
        "prevention": [
            "Continue preventative bi-weekly field scouting and canopy health monitoring",
            "Maintain optimal root zone moisture balance and soil organic matter content",
            "Apply prophylactic beneficial microbial inoculants (e.g., Trichoderma spp.)"
        ]
    },
    "Potato_Early_Blight": {
        "display_name": "Potato Early Blight",
        "crop": "Potato",
        "default_severity": "Moderate",
        "symptoms": [
            "Dark brown, angular spots with concentric target rings on lower foliage",
            "Yellowing leaf borders and progressive senescence",
            "Dry, leathery, dark sunken lesions on tuber surfaces"
        ],
        "treatment": [
            "Apply protectant fungicides (mancozeb or azoxystrobin) at first sign of lesions",
            "Regulate nitrogen fertilization to avoid plant stress and premature canopy aging",
            "Improve field aeration by adjusting hill orientation and spacing"
        ],
        "prevention": [
            "Use certified pathogen-free seed tubers",
            "Follow 2 to 3 year rotation away from solanaceous species",
            "Ensure proper vine desiccation prior to harvesting tubers"
        ]
    },
    "Potato_Late_Blight": {
        "display_name": "Potato Late Blight",
        "crop": "Potato",
        "default_severity": "High",
        "symptoms": [
            "Fast-expanding dark brown, water-soaked foliage blights",
            "Faint white mildew on undersides of leaves during high relative humidity (>90%)",
            "Rotting tubers showing granular rust-colored flesh beneath skin"
        ],
        "treatment": [
            "Apply preventive protectant fungicides (chlorothalonil, fluazinam) ahead of rain fronts",
            "Destroy active field hot spots immediately to stop aerial zoospore dissemination",
            "Ensure tubers are harvested only after vines have been dead for at least 14 days"
        ],
        "prevention": [
            "Plant only certified clean seed lots tested for Phytophthora infestans",
            "Destroy all potato cull piles before planting season starts",
            "Utilize high hilling to create a soil buffer preventing spore wash to tubers"
        ]
    },
    "Potato_Healthy": {
        "display_name": "Potato Healthy",
        "crop": "Potato",
        "default_severity": "None",
        "symptoms": [
            "Lush, uniform foliage with deep green pigmentation",
            "No foliar blemishes, lesions, or vascular wilting",
            "Robust root system and active tuberization"
        ],
        "treatment": [
            "No chemical intervention needed",
            "Maintain consistent hilling and weed control",
            "Monitor soil moisture tension between 25-35 kPa"
        ],
        "prevention": [
            "Maintain regular weekly field inspection passes",
            "Ensure balanced potassium nutrition to enhance natural epidermal toughness",
            "Avoid mechanical damage during cultivation"
        ]
    },
    "Corn_Leaf_Blight": {
        "display_name": "Corn Leaf Blight (Northern / Southern)",
        "crop": "Corn (Maize)",
        "default_severity": "Moderate",
        "symptoms": [
            "Long, elliptical, grayish-green to tan lesions (cigar-shaped)",
            "Lesions measuring 2.5 to 15 cm running parallel to leaf veins",
            "Extensive foliar blighting reducing photosynthetic ear-fill capacity"
        ],
        "treatment": [
            "Apply foliar triazole or strobilurin fungicides if blighting reaches ear leaf before silking",
            "Avoid late season nitrogen deficiencies which exacerbate leaf blighting",
            "Manage field debris post-harvest with conservation tillage"
        ],
        "prevention": [
            "Plant corn hybrids with high resistance scores (e.g., Ht gene resistance)",
            "Practice crop rotation with non-host crops such as soybeans or alfalfa",
            "Incorporate infected crop residue to accelerate biological breakdown"
        ]
    },
    "Corn_Healthy": {
        "display_name": "Corn Healthy",
        "crop": "Corn (Maize)",
        "default_severity": "None",
        "symptoms": [
            "Broad, vigorous green leaf blades free of spots or striping",
            "Strong stalk development and healthy nodal brace roots",
            "Uniform vegetative whorl growth"
        ],
        "treatment": [
            "No curative intervention required",
            "Optimize side-dress nitrogen timing around V6 development stage",
            "Ensure uniform weed suppression"
        ],
        "prevention": [
            "Maintain optimal seeding density (30,000 - 34,000 plants/acre)",
            "Perform soil fertility testing every 2 seasons",
            "Keep records of previous seasonal crop performance"
        ]
    },
    "Rice_Leaf_Disease": {
        "display_name": "Rice Leaf Blast / Brown Spot",
        "crop": "Rice",
        "default_severity": "High",
        "symptoms": [
            "Spindle-shaped or diamond lesions with grayish-white centers and reddish-brown margins",
            "Brown oval spots on leaf blades, glumes, and coleoptiles",
            "Neck blast causing panicles to whiten and fall over (lodging)"
        ],
        "treatment": [
            "Drain excess water if field is excessively submerged and re-flood with fresh water",
            "Apply tricyclazole, isoprothiolane, or validamycin according to registered dosages",
            "Split nitrogen applications into multiple smaller doses to avoid succulent blast-susceptible tissue"
        ],
        "prevention": [
            "Use certified resistant rice varieties suited to your agro-ecological zone",
            "Treat seeds with hot water (52-54°C) or carbendazim prior to sowing",
            "Maintain balanced silicon (Si) and potassium (K) nutrition to reinforce leaf cell walls"
        ]
    },
    "Rice_Healthy": {
        "display_name": "Rice Healthy",
        "crop": "Rice",
        "default_severity": "None",
        "symptoms": [
            "Erect, bright emerald green leaf blades without spots",
            "Clean tillering nodes and vigorous root crown",
            "Uniform panicle emergence without blast discoloration"
        ],
        "treatment": [
            "No fungicide intervention needed",
            "Maintain controlled water depth (3-5 cm) across paddy terraces",
            "Provide timely panicle initiation nutrient top-dressing"
        ],
        "prevention": [
            "Continuous monitoring of field water pH and dissolved oxygen",
            "Maintain weed-free bunds to remove alternate grass hosts",
            "Promote biodiversity of beneficial predator insects (spiders, dragonflies)"
        ]
    }
}


def get_train_transforms() -> transforms.Compose:
    """Returns PyTorch data augmentation and normalization pipeline for training."""
    return transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomResizedCrop(IMG_SIZE, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORM_MEAN, std=NORM_STD),
    ])


def get_eval_transforms() -> transforms.Compose:
    """Returns standard validation and inference preprocessing transform pipeline."""
    return transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORM_MEAN, std=NORM_STD),
    ])


def preprocess_image_for_inference(image: Image.Image) -> torch.Tensor:
    """
    Validates, converts, and normalizes a PIL Image into a model-ready 4D batch tensor.
    Shape: [1, 3, 224, 224]
    """
    if image.mode != "RGB":
        image = image.convert("RGB")
    transform = get_eval_transforms()
    tensor = transform(image)
    return tensor.unsqueeze(0)  # Add batch dimension


def enrich_prediction(disease_name: str, confidence_pct: float) -> Dict[str, Any]:
    """
    Combines the raw ML classification prediction with agronomic domain knowledge
    for disease identification, treatment, and prevention protocols.
    """
    advisory = DISEASE_ADVISORY.get(disease_name, {
        "display_name": disease_name.replace("_", " "),
        "crop": "Tomato" if "Tomato" in disease_name else ("Potato" if "Potato" in disease_name else ("Corn" if "Corn" in disease_name else "Rice")),
        "default_severity": "Moderate" if "Healthy" not in disease_name else "None",
        "symptoms": [
            "Leaf tissue demonstrates focal chlorotic spotting and margin discoloration",
            "Pathological lesions observed on foliar blade"
        ],
        "treatment": [
            "Isolate infected vegetation and prune damaged foliar tissue",
            "Apply protective copper or broad-spectrum agronomic fungicide",
            "Optimize canopy ventilation to decrease relative humidity"
        ],
        "prevention": [
            "Practice multi-season crop rotation",
            "Avoid overhead irrigation to keep leaf blades dry",
            "Regularly inspect lower canopy foliage for early symptom manifestation"
        ]
    })

    if "Healthy" in disease_name:
        severity = "None"
    else:
        severity = advisory.get("default_severity", "Moderate")

    return {
        "disease": advisory["display_name"],
        "raw_class": disease_name,
        "crop": advisory.get("crop", "Crop"),
        "confidence": round(confidence_pct, 1),
        "severity": severity,
        "is_low_confidence": False,
        "confidence_warning": None,
        "supported_crops": ["Tomato", "Potato", "Corn", "Rice"],
        "symptoms": advisory["symptoms"],
        "treatment": advisory["treatment"],
        "prevention": advisory["prevention"],
    }
