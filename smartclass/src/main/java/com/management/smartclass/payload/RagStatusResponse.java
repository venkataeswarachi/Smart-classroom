package com.management.smartclass.payload;

public class RagStatusResponse {
    private String status;
    private int documentsInStore;
    private String collectionName;

    public RagStatusResponse() {
    }

    public RagStatusResponse(String status, int documentsInStore, String collectionName) {
        this.status = status;
        this.documentsInStore = documentsInStore;
        this.collectionName = collectionName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getDocumentsInStore() {
        return documentsInStore;
    }

    public void setDocumentsInStore(int documentsInStore) {
        this.documentsInStore = documentsInStore;
    }

    public String getCollectionName() {
        return collectionName;
    }

    public void setCollectionName(String collectionName) {
        this.collectionName = collectionName;
    }
}
