package com.example.pictime.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
public class Event {
    @Id
    private String id = UUID.randomUUID().toString();
    private String title;
    private String description;
    private String creatorId;
    private LocalDateTime createdAt = LocalDateTime.now();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "event_candidate_dates", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "candidate_date")
    private java.util.List<String> candidateDates = new java.util.ArrayList<>();
    public java.util.List<String> getCandidateDates() {
        return candidateDates;
    }
    public void setCandidateDates(java.util.List<String> candidateDates) {
        this.candidateDates = candidateDates;
    }

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getCreatorId() {
        return creatorId;
    }
    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
