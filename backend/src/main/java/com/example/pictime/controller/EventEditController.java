package com.example.pictime.controller;

import com.example.pictime.entity.Event;
import com.example.pictime.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Deprecated: EventEditController previously exposed duplicate request mappings.
 * The functionality is consolidated in EventController. Keep as a component
 * for potential refactorings without exposing HTTP endpoints.
 */
@Component
public class EventEditController {
    
    @Autowired
    private EventService eventService;
    
    // (methods intentionally removed to avoid ambiguous request mappings)
}
