public with sharing class BoatDataService {
    
    @AuraEnabled(cacheable=true)
    public static List<BoatType__c> getBoatTypes(){
        try {
            return [SELECT Id, Name
                    FROM BoatType__c
                    ORDER BY Name ASC];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Boat__c> getBoats(String boatTypeId){
        try {
            String query = 'SELECT Id, Contact__r.Name, Boat_Image__c, Name, Description__c, Geolocation__latitude__s,Geolocation__longitude__s, Picture__c, Price__c, Length__c, BoatType__r.Name, CreatedBy.Name FROM Boat__c';

            if( boatTypeId != '' ) query += ' WHERE BoatType__c =:boatTypeId';
            return Database.query(query);

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Response updateBoatList(Object data){
        try {
            List<Boat__c> editedBoats =   (List<Boat__c>)  JSON.deserialize(JSON.serialize(data), List<Boat__c>.class);
            update editedBoats;
            return new Response(true, null);
        } catch (Exception e) {
            return new Response(false, e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getBoatsByLocation(Decimal longitude, Decimal latitude, String boatTypeId){
        
        List<Boat__c> boats = new List<Boat__c>();
        if(boatTypeId == null) return JSON.serialize(boats);

        try {
            boats =  [SELECT Id, Name, Geolocation__latitude__s,Geolocation__longitude__s 
                      FROM Boat__c 
                      WHERE BoatType__r.Id = :boatTypeId
                      AND DISTANCE(Geolocation__c, GEOLOCATION(:latitude, :longitude), 'mi') < 10000
                      ORDER BY DISTANCE(Geolocation__c, GEOLOCATION(:latitude, :longitude), 'mi') LIMIT 10];
            return JSON.serialize(boats);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Boat__c> getSimilarBoats(String boatId, String similarBy){
        try {
            return [SELECT Id, Name, Contact__r.Name, Price__c, Length__c, BoatType__r.Name, Picture__c FROM Boat__c
                    WHERE Id != :boatId]; 
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<BoatReview__c> getAllReviews(Id boatId){
        try {
            return [SELECT Id, Name, Comment__c, Rating__c, Boat__r.Picture__c, CreatedBy.SmallPhotoUrl, CreatedBy.CompanyName, CreatedBy.Name, CreatedDate
                    FROM BoatReview__c
                    WHERE Boat__r.Id = :boatId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class Response{
        @AuraEnabled
        public Boolean isSuccess;
        @AuraEnabled
        public String message;

        public Response(Boolean isSuccess, String message){
            this.isSuccess = isSuccess;
            this.message = message;
        }
    }
}
