# Future You – Health Time Machine

A web-based health analytics application that projects potential future health risks based on current lifestyle, habits, and medical history. The system combines rule-based risk modeling with keyword-driven analysis to provide a structured, explainable forecast over 5, 10, and 20-year timelines.

This project was developed as part of the **HACKMARCH 2.0 Hackathon**.

---

## Overview

Future You allows users to input personal health and lifestyle data such as age, BMI factors, sleep, stress, diet, and medical history. The application processes this information through a simulated clinical dataset and generates:

* Multi-year health risk projections
* Category-wise risk scores (e.g., diabetes, heart disease, mental health)
* Transparent reasoning behind each prediction
* Personalized recommendations for risk reduction

The system emphasizes interpretability, ensuring users understand *why* each risk is assigned.

---

## Features

### Health Risk Projection

* Forecasts health risks over 5, 10, and 20 years
* Uses dataset-driven multipliers and time-based scaling

### BMI and Lifestyle Analysis

* Real-time BMI calculation and categorization
* Impact modeling for exercise, sleep, stress, diet, smoking, and alcohol

### NLP-Based Health Insights

* Extracts keywords from user-provided notes and medical history
* Maps detected terms to risk modifiers using a structured dataset

### Explainable AI Reasoning

* Step-by-step breakdown of how each risk is computed
* Displays contributing factors such as BMI, habits, and history

### Personalized Recommendations

* Suggests actionable improvements based on detected risks
* Focuses on high-impact lifestyle changes

---

## Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Styling:** Custom CSS (dark medical futurism theme)
* **Logic Engine:** Vanilla JavaScript with rule-based modeling
* **Interface:** Responsive UI with dynamic rendering

---

## How It Works

1. User inputs health and lifestyle data
2. System calculates BMI and baseline risk values
3. Lifestyle factors apply weighted modifiers
4. NLP extracts keywords from health notes and history
5. Risks are adjusted using dataset mappings
6. Time projection scales risks across selected years
7. Results are displayed with explanations and recommendations

---

## Key Concepts

* **Risk Modeling:** Based on predefined clinical-style multipliers
* **Keyword Mapping:** Links user text input to health risk categories
* **Explainability:** Every output is backed by visible reasoning steps
* **Simulation Dataset:** Uses embedded fallback data when external data is unavailable

---

## Team

* [Amogh Poonakar](https://github.com/amoghpoonakar/)
* [Adithya Narayana H R](https://github.com/adithyanarayanahr/)
* [Aluvala Sai Shailu Sri](https://github.com/aluvala-shailusri/)
* [Yesireddy Mokshitha](https://github.com/yesireddymokshitha/)

---

## Author

**Amogh**

---

## Disclaimer

This project is intended for educational and demonstration purposes only. It does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns.

---

## Acknowledgment

Built during **HACKMARCH 2.0**, focusing on combining intuitive UI design with interpretable health analytics.
