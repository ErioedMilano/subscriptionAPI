package sr.unasat.subscription.api.services;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.Query;
import sr.unasat.subscription.api.config.JPAConfiguration;
import sr.unasat.subscription.api.entity.Subscription;

import java.util.List;

public class SubscriptionService {
    private EntityManager entityManager;

    public SubscriptionService() {
        this.entityManager = JPAConfiguration.getEntityManager();
    }

    public List<Subscription> findAll() {
        TypedQuery<Subscription> query = entityManager.createQuery("SELECT s FROM Subscription s", Subscription.class);
        return query.getResultList();
    }

    public Subscription findById(int id) {
        return entityManager.find(Subscription.class, id);
    }

    public Subscription save(Subscription subscription) {
        entityManager.getTransaction().begin();
        entityManager.persist(subscription);
        entityManager.getTransaction().commit();
        return subscription;
    }

    public Subscription update(Subscription subscription) {
        entityManager.getTransaction().begin();
        subscription = entityManager.merge(subscription);
        entityManager.getTransaction().commit();
        return subscription;
    }

    public void delete(int id) {
        entityManager.getTransaction().begin();
        Subscription subscription = entityManager.find(Subscription.class, id);
        if (subscription != null) {
            entityManager.remove(subscription);
        }
        entityManager.getTransaction().commit();
    }

    public long getTotalUsers() {
        Query query = entityManager.createQuery("SELECT COUNT(s) FROM Subscription s");
        return (Long) query.getSingleResult();
    }

    public long getSubscriptionCount(String type) {
        Query query = entityManager.createQuery(
                "SELECT COUNT(s) FROM Subscription s WHERE s.subscription = :type"
        );
        query.setParameter("type", type);
        return (Long) query.getSingleResult();
    }

    public boolean updateStatus(int id, Subscription.SubscriptionStatus status) {
        entityManager.getTransaction().begin();
        Subscription subscription = entityManager.find(Subscription.class, id);
        if (subscription != null) {
            subscription.setStatus(status);
            entityManager.merge(subscription);
            entityManager.getTransaction().commit();
            return true;
        }
        entityManager.getTransaction().rollback();
        return false;
    }
}