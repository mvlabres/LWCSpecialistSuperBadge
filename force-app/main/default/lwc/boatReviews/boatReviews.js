import { api, LightningElement, track } from 'lwc';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { NavigationMixin } from 'lightning/navigation'

export default class BoatReviews extends NavigationMixin(LightningElement) {
    @api boatId;
    error;
    @track boatReviews;
    isLoading;
    
    // Getter and Setter to allow for logic to run on recordId change
    @api 
    get recordId() { 
        return this.boatId;
    }
    set recordId(value) {
        this.setAttribute('boatId', value);
        this.boatId = value;
        this.getReviews();
    }
    
    // Getter to determine if there are reviews to display
    get reviewsToShow() { 
        return this.boatReviews && this.boatReviews.length > 0;
    }
    
    @api refresh() { 
        this.getReviews();
    }
    
    getReviews() { 
        if(!this.boatId) return;
        this.isLoading = true;

        getAllReviews({boatId: this.boatId })
        .then(result=>{
            this.boatReviews = result;
        }).catch(error=>{
            console.log(error.body.message);
        }).finally(()=>{
            this.isLoading = false;
        });
    }
    
    navigateToRecord(event) { 
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: event.target.dataset.recordId,
                actionName: "view"
            }
        });
            
     }

}