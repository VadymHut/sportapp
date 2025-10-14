package com.proj.webapp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "client")
@Getter
@Setter
@ToString(callSuper = true)
@NoArgsConstructor
public class Client extends Person
{

}
