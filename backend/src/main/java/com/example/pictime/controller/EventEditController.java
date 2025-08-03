package com.example.pictime.controller;

import com.example.pictime.entity.Event;
import com.example.pictime.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:3000")
public class EventEditController {
    
    @Autowired
    private EventService eventService;
    
    // イベント取得
    @GetMapping("/{eventId}/edit")
    public ResponseEntity<?> getEventForEdit(@PathVariable String eventId) {
        Optional<Event> eventOpt = eventService.findById(eventId);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            return ResponseEntity.ok().body(event);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // イベント更新
    @PutMapping("/{eventId}")
    public ResponseEntity<?> updateEvent(@PathVariable String eventId, @RequestBody Event updateRequest) {
        Optional<Event> eventOpt = eventService.findById(eventId);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            
            // 基本情報更新
            event.setTitle(updateRequest.getTitle());
            event.setDescription(updateRequest.getDescription());
            event.setCandidateDates(updateRequest.getCandidateDates());
            
            Event updatedEvent = eventService.save(event);
            return ResponseEntity.ok().body(updatedEvent);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
