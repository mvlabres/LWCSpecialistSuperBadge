import { LightningElement, track, wire } from 'lwc';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import labelReviews from '@salesforce/label/c.Reviews';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
import labelDetails from '@salesforce/label/c.Details';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelAddReview from '@salesforce/label/c.Add_Review';
import { APPLICATION_SCOPE, subscribe, MessageContext } from 'lightning/messageService';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
    @track boatId;
    label = {
        labelDetails,
        labelReviews,
        labelAddReview,
        labelFullDetails,
        labelPleaseSelectABoat,
    };

    @wire(MessageContext)
    messageContext

    @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS})
    wiredRecord
  
    get detailsTabIconName() {
        return (this.wiredRecord.data) ? 'utility:anchor' : null;
    }
    
    get boatName() { 
        return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
    }
    
    subscription = null;
    
    subscribeMC() {

        if (this.subscription || this.recordId) {
            return;
        }

        this.subscription = subscribe(this.messageContext,BOATMC,
            (message) => this.boatId = message.recordId,
            { scope: APPLICATION_SCOPE }
        );
    }

    connectedCallback() {
        this.subscribeMC();
    }
    
    navigateToRecordViewPage() { 
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                objectApiName: 'Bout__c',
                actionName: 'view'
            },
        });
    }
    
    // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated() { 
        this.template.querySelector('lightning-tabset').activeTabValue = this.label.labelReviews;
        this.template.querySelector('c-boat-reviews').refresh();
    }
}
