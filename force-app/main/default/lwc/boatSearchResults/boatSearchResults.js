import { api, wire, LightningElement } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', type: 'text', editable: true },
    { label: 'Lenght', fieldName: 'Length__c', type: 'number', editable: true},
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true},
    { label: 'Description', fieldName: 'Description__c', type: 'text', editable: true}
];

export default class BoatSearchResults extends LightningElement {
    selectedBoatId;
    columns = COLUMNS;
    boatTypeId = '';
    boats;
    isLoading = false;
    
    @wire(MessageContext)
    messageContext

    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats({ error, data }) {
        if (data) {
            this.boats = data;
            this.notifyLoading(false);
        } else if (error) {
            console.error('Error:', error);
            this.notifyLoading(false);
        }
    }
    
    @api
    searchBoats(boatTypeId) {
        this.notifyLoading(true);
        this.boatTypeId = boatTypeId;
    }

    @api 
    async refresh() {
        this.isLoading = true;
        this.notifyLoading(true); 
        return await refreshApex(this.boats); 
    }
    
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
     }
    

    sendMessageService(boatId) { 

        try {
            const payload = { recordId: boatId};
            publish(this.messageContext, BOATMC, payload);
        } catch (error) {
            console.log(error);
        }
    }
    
    handleSave(event) {
        this.notifyLoading(true);
        const recordInputs = event.detail.draftValues.slice().map(draft=>{
            const fields = Object.assign({}, draft);
            return {fields};
        });

        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
           this.dispatchEvent(
               new ShowToastEvent({
                   title: SUCCESS_TITLE,
                   message: MESSAGE_SHIP_IT,
                   variant: SUCCESS_VARIANT
               })
           ); 
       }).catch(error => {
           this.dispatchEvent(
                new ShowToastEvent({
                    title:ERROR_TITLE,
                    message: error.body.message,
                    variant: ERROR_VARIANT
                })
            );
            
       }).finally(() => {
            this.draftValues = [];
            this.notifyLoading(false);
            this.refresh();
        });
    }

    handleCancel(){
        this.clearDatatable();
    }

    clearDatatable(){
        this.template.querySelector("lightning-datatable").draftValues = [];
    }

    notifyLoading(isLoading) { 

        const eventName = (isLoading) ? 'loading' : 'doneloading';
        const customEvent = new CustomEvent(eventName, {})

        this.dispatchEvent(customEvent);
    }

    showToast(title, message, variant){
        const showToastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        })

        this.dispatchEvent(showToastEvent);
    }
}
