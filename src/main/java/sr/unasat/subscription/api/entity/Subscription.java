package sr.unasat.subscription.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "subscriptions")
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "First name is required")
    @Column(nullable = false)
    private String firstname;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false)
    private String lastname;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Column(nullable = false)
    private String phonenumber;

    @Column
    private String subscription;

    @Column
    private String services; // Comma-separated values for checkboxes

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status = SubscriptionStatus.Pending;

    // Constructors
    public Subscription() {}

    public Subscription(String firstname, String lastname, String email, String phonenumber) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.phonenumber = phonenumber;
    }

    public Subscription(String firstname, String lastname, String email, String phonenumber,
                        String subscription, String services, SubscriptionStatus status) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.phonenumber = phonenumber;
        this.subscription = subscription;
        this.services = services;
        this.status = status;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getFirstname() { return firstname; }
    public void setFirstname(String firstname) { this.firstname = firstname; }
    public String getLastname() { return lastname; }
    public void setLastname(String lastname) { this.lastname = lastname; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhonenumber() { return phonenumber; }
    public void setPhonenumber(String phonenumber) { this.phonenumber = phonenumber; }
    public String getSubscription() { return subscription; }
    public void setSubscription(String subscription) { this.subscription = subscription; }
    public String getServices() { return services; }
    public void setServices(String services) { this.services = services; }
    public SubscriptionStatus getStatus() { return status; }
    public void setStatus(SubscriptionStatus status) { this.status = status; }

    public enum SubscriptionStatus {
        Pending, Active, Inactive
    }
}