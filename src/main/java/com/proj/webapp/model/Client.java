package com.proj.webapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "client")
@Getter @Setter
@NoArgsConstructor
@ToString(callSuper = true, exclude = "memberships")
public class Client extends Person {

    @OneToMany(
            mappedBy = "client",
            fetch = FetchType.LAZY,
            cascade = { CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE},
            orphanRemoval = true
    )
    @OrderBy("startingDate DESC")
    @JsonIgnore
    private List<Membership> memberships = new ArrayList<>();

}
