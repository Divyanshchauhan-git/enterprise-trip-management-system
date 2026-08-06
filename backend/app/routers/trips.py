from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.trip import Trip
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()

class TripCreate(BaseModel):
    driver_name: str
    total_gallons: int
    total_stops: int = 0
    status: str

class TripUpdate(BaseModel):
    driver_name: str
    total_gallons: int
    total_stops: int
    status: str

@router.get("/trips")
async def get_trips(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trips = db.query(Trip).all()
    return [{"id": t.id, "driver_name": t.driver_name, "total_gallons": t.total_gallons, "total_stops": t.total_stops, "status": t.status} for t in trips]

@router.get("/trips/{trip_id}")
async def get_single_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"id": trip.id, "driver_name": trip.driver_name, "total_gallons": trip.total_gallons, "total_stops": trip.total_stops, "status": trip.status}

@router.post("/trips")
async def create_trip(trip: TripCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_trip = Trip(driver_name=trip.driver_name, total_gallons=trip.total_gallons, total_stops=trip.total_stops, status=trip.status)
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return {"message": "Trip created successfully", "trip": {"id": new_trip.id, "driver_name": new_trip.driver_name, "total_gallons": new_trip.total_gallons, "total_stops": new_trip.total_stops, "status": new_trip.status}}

@router.put("/trips/{trip_id}")
async def update_trip(trip_id: int, updated_trip: TripUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.driver_name = updated_trip.driver_name
    trip.total_gallons = updated_trip.total_gallons
    trip.total_stops = updated_trip.total_stops
    trip.status = updated_trip.status
    db.commit()
    db.refresh(trip)
    return {"message": "Trip updated successfully", "trip": {"id": trip.id, "driver_name": trip.driver_name, "total_gallons": trip.total_gallons, "total_stops": trip.total_stops, "status": trip.status}}

@router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted successfully"}