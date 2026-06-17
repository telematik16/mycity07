from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import pandas as pd
import requests
import xml.etree.ElementTree as ET
import os

app = FastAPI(title="TKO Control Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock DB for geozones (in real project use PostgreSQL)
GEOZONES = []

@app.on_event("startup")
async def startup_event():
    # Parse KML on startup
    kml_path = "export.kml"
    if os.path.exists(kml_path):
        tree = ET.parse(kml_path)
        root = tree.getroot()
        namespace = {'kml': 'http://www.opengis.net/kml/2.2'}
        
        for placemark in root.findall('.//kml:Placemark', namespace):
            name = placemark.find('kml:name', namespace).text
            coords = placemark.find('.//kml:coordinates', namespace).text
            GEOZONES.append({"name": name, "coordinates": coords.strip()})
        print(f"Loaded {len(GEOZONES)} geozones from KML")

@app.post("/api/sync-fact")
async def sync_fact(date: str = Form(...)):
    # 1. Auth GLONASSSoft
    # response = requests.post("https://api.glonasssoft.ru/api/v3/auth/login", json={"login": "...", "password": "..."})
    # token = response.json().get("token")
    
    # 2. Execute Report
    # report_params = {"templateId": 123, "from": f"{date}T00:00:00", "to": f"{date}T23:59:59"}
    # fact_data = requests.post("...", headers={"Authorization": f"Bearer {token}"}, json=report_params).json()
    
    # Mock response for demo
    return {
        "status": "success",
        "data": [
            {"Госномер": "А123БВ07", "Адрес": "НАЛЬЧИК УЛ.ТАРЧОКОВА 139 АФИНА 1К", "Время": "09:15"},
            {"Госномер": "В777ХК07", "Адрес": "НАЛЬЧИК УЛ.КУЛИЕВА 5", "Время": "10:30"}
        ]
    }

@app.get("/api/geozones")
async def get_geozones():
    return {"count": len(GEOZONES), "items": GEOZONES[:10]} # Return sample

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
