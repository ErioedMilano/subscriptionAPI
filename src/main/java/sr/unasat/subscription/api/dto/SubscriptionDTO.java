package sr.unasat.subscription.api.dto;

import sr.unasat.subscription.api.entity.Subscription.SubscriptionStatus;

public class SubscriptionDTO {
    private int id;
    private String firstname;
    private String lastname;
    private String email;
    private String phonenumber;
    private String subscription;
    private String services;
    private SubscriptionStatus status;

    public SubscriptionDTO() {
    }

    public SubscriptionDTO(int id, String firstname, String lastname, String email, String phonenumber) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.phonenumber = phonenumber;
    }

    public SubscriptionDTO(int id, String firstname, String lastname, String email, String phonenumber,
                           String subscription, String services, SubscriptionStatus status) {
        this.id = id;
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

    @Override
    public String toString() {
        return "SubscriptionDTO{" +
                "id=" + id +
                ", firstname='" + firstname + '\'' +
                ", lastname='" + lastname + '\'' +
                ", email='" + email + '\'' +
                ", phonenumber='" + phonenumber + '\'' +
                ", subscription='" + subscription + '\'' +
                ", services='" + services + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}