package com.proj.webapp.service;

import com.proj.webapp.model.Staff;
import com.proj.webapp.repo.CheckInRepo;
import com.proj.webapp.repo.StaffRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@RequiredArgsConstructor
@Validated
@Transactional
public class StaffService
{

    private final StaffRepo staffRepo;
    private final CheckInRepo checkInRepo;

    public Staff create(@Valid @NotNull Staff newStaff)
    {
        if (newStaff.getPeId() != null) {
            throw new IllegalArgumentException("peId should not be set");
        }
        if (staffRepo.existsByPersonalCode(newStaff.getPersonalCode()))
        {
            throw new IllegalArgumentException("A person with such a personal code already exists");
        }
        return staffRepo.save(newStaff);
    }

    @Transactional(readOnly = true)
    public Staff getById(@NotNull Long id)
    {
        return staffRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Staff with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public List<Staff> listAll()
    {
        return staffRepo.findAll();
    }

    public Staff update(@NotNull Long id, @Valid @NotNull Staff editedStaff)
    {
        var existing = staffRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Staff with id " + id + " not found"));

        existing.setName(editedStaff.getName());
        existing.setSurname(editedStaff.getSurname());
        existing.setEmail(editedStaff.getEmail());
        if (editedStaff.getJoinedOn() != null)
        {
            existing.setJoinedOn(editedStaff.getJoinedOn());
        }
        existing.setJobTitle(editedStaff.getJobTitle());
        return existing;
    }

    public void delete(@NotNull Long id)
    {
        var staff = staffRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Staff with id " + id + " not found"));
        if (checkInRepo.existsByStaff(staff))
        {
            throw new IllegalStateException("Cannot delete staff with existing check-ins");
        }
        staffRepo.delete(staff);
    }
}
