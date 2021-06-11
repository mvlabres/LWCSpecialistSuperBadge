import { api, LightningElement, track, wire } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {

    @api boatTypeId;
    mapMarkers = [];
    isLoading = true;
    @track isRendered;
    latitude;
    longitude;
    
    @wire(getBoatsByLocation, {longitude: '$longitude', latitude: '$latitude', boatTypeId: '$boatTypeId'})
    wiredBoatsJSON({ error, data }) {
        if (data) {
            this.createMapMarkers(JSON.parse(data));
            
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.body.message,
                    variant: ERROR_VARIANT
                })
            );
        }
        this.isLoading = false;
     }
    
    renderedCallback() { 
        if(!this.isRendered){
            this.getLocationFromBrowser();
            this.isRendered = true;
        }
            
    }
    
    getLocationFromBrowser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
            });
        }
    }
    
    createMapMarkers(boatData) {
        const newMarkers = boatData.map(boat => {
            return{
                location: {
                    Latitude: boat.Geolocation__Latitude__s,
                    Longitude: boat.Geolocation__Longitude__s
                },
                title: boat.Name
            }
        });

        if(newMarkers) this.mapMarkers = newMarkers;
        
        this.mapMarkers.unshift(
                {
                    location: {
                        Latitude: this.latitude,
                        Longitude: this.longitude
                    },

                    icon: ICON_STANDARD_USER,
                    title: LABEL_YOU_ARE_HERE
                });
    }
}