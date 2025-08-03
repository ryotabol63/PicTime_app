package com.example.pictime.entity;

import jakarta.persistence.*;
//import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "availabilities")
public class Availability {
    @Id
    private String id = UUID.randomUUID().toString();
    private String eventId;
    private String participantName;
    private String availableDate;
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getEventId() {
        return eventId;
    }
    public void setEventId(String eventId) {
        this.eventId = eventId;
    }
    public String getParticipantName() {
        return participantName;
    }
    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }
    public String getAvailableDate() {
        return availableDate;
    }
    public void setAvailableDate(String availableDate) {
        this.availableDate = availableDate;
    }
}
