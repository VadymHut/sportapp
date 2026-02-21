package com.proj.webapp.service;

import com.proj.webapp.model.ActivityType;
import com.proj.webapp.model.GroupType;
import com.proj.webapp.model.FrequencyType;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class EnumService
{

    public List<String> activityTypes()
    {
        return Arrays.stream(ActivityType.values()).map(Enum::name).toList();
    }

    public List<String> groupTypes()
    {
        return Arrays.stream(GroupType.values()).map(Enum::name).toList();
    }

    public List<String> frequencyTypes()
    {
        return Arrays.stream(FrequencyType.values()).map(Enum::name).toList();
    }
}
