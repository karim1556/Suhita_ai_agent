# Rural Healthcare AI Assistant

This project introduces an AI-powered healthcare assistant designed to enhance telemedicine services in rural hospitals. It integrates AI-driven diagnosis, patient registration, and doctor collaboration within a kiosk system to improve accessibility, efficiency, and record management in rural healthcare facilities.

## Features

### AI-Powered Patient Triage & Assistance
- 🤖 AI-driven initial patient assessment using RAG data and vector databases
- 🏥 Automatic urgency detection with escalation to human specialists
- 📞 Immediate call placement for critical cases

### Digital Case Paper & Record Management
- 📋 Paperless patient registration and case paper generation
- 🔄 Secure storage of patient history for better follow-ups
- 🔍 Quick retrieval and updates of previous medical records

### Seamless Doctor Collaboration
- 👨‍⚕️ On-site practicing doctor assesses AI-generated summaries
- 📡 Scheduled virtual consultations with specialist doctors
- 📜 AI-generated conversation summaries sent to specialists for review

## System Workflow
1. **Patient Registration**: The patient fills a digital case paper at the kiosk.
2. **AI Interaction**: AI assesses symptoms and determines the urgency level.
3. **Doctor Consultation**:
   - Normal cases: AI schedules an appointment with the on-site doctor.
   - Urgent cases: AI immediately alerts a human specialist via call.
4. **Medical Summary Generation**: AI generates a summary of the consultation and updates the patient's records.
5. **Specialist Review**: Practicing doctors forward relevant cases to specialists for scheduled consultations.
6. **Follow-up & Record Management**: The system maintains patient history for future reference.

## Running the Project Locally

### Prerequisites
- **Node.js & npm** (for the frontend)
- **MongoDB, Express.js, React.js, Node.js** (MERN stack for backend development)
- **Twilio API** (for urgent call placement)
- **Vector Database** (for storing AI-interaction data)

### Setup Instructions

#### Backend Setup
```bash
cd agent
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt


#Finally, run the agent with:

bash
python main.py dev
```

#### Frontend Setup
```bash
cd agents-playground-main 2
npm install
npm start
```

#### AI & Database Setup
- Configure AI API keys in `.env` file.
- Set up MongoDB database for patient records.

## Future Enhancements
- 📡 Integration with government healthcare databases
- 📱 Mobile app support for remote patient consultations
- 📊 AI analytics dashboard for healthcare providers

This project aims to bridge the healthcare gap in rural areas by combining AI efficiency with human expertise, ensuring timely and quality medical care.

