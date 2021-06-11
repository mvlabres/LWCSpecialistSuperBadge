import { api, LightningElement } from 'lwc';

const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';

export default class BoatTile extends LightningElement {
    @api boat;
    @api selectedBoatId;
    
    get backgroundStyle() { 
        return `background-image:url(${this.boat.Picture__c})`;
    }

    get tileClass() {
        return (!this.selectedBoatId || this.boat.Id != this.selectedBoatId) ? TILE_WRAPPER_UNSELECTED_CLASS : TILE_WRAPPER_SELECTED_CLASS;
    }

    selectBoat() {
        this.selectedBoatId = this.boat.Id;
        const custonEvent = new CustomEvent('boatselect', {
            detail: {boatId: this.selectedBoatId}
        })
        this.dispatchEvent( custonEvent );
    }
}