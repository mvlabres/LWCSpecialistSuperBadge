import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class BoatSearch extends NavigationMixin(LightningElement) {
    isLoading = false;

    _boatTypeId;
    
    // Handles loading event
    handleLoading() {
        this.isLoading = true;
     }
    
    // Handles done loading event
    handleDoneLoading() { 
        this.isLoading = false;
    }
    
    searchBoats(event) { 
        this._boatTypeId = event.detail.boatTypeId; 
        this.template.querySelector('c-boat-search-results').searchBoats(this._boatTypeId);
    }
    
    createNewBoat() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new',
            },
        });
     }
}