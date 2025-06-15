package sr.unasat.subscription.api.controllers;

import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import sr.unasat.subscription.api.dto.SubscriptionDTO;
import sr.unasat.subscription.api.entity.Subscription;
import sr.unasat.subscription.api.services.SubscriptionService;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.Set;
import java.util.List;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@Path("/subscriptions")
public class SubscriptionController {
    private final SubscriptionService service = new SubscriptionService();

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<SubscriptionDTO> getAllSubscriptions() {
        return service.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSubscription(@PathParam("id") int id) {
        Subscription sub = service.findById(id);
        if (sub != null) {
            return Response.ok(toDTO(sub)).build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createSubscription(@Valid SubscriptionDTO dto) {
        try {
            if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email is required");
            }

            Subscription sub = service.save(toEntity(dto));
            return Response.status(Response.Status.CREATED)
                    .entity(toDTO(sub))
                    .build();
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(errorResponse)
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateSubscription(@PathParam("id") int id, SubscriptionDTO dto) {
        try {
            Subscription existing = service.findById(id);
            if (existing != null) {
                existing.setFirstname(dto.getFirstname());
                existing.setLastname(dto.getLastname());
                existing.setEmail(dto.getEmail());
                existing.setPhonenumber(dto.getPhonenumber());
                existing.setSubscription(dto.getSubscription());
                existing.setServices(dto.getServices());
                Subscription updated = service.update(existing);
                return Response.ok(toDTO(updated)).build();
            }
            return Response.status(Response.Status.NOT_FOUND).build();
        } catch (ConstraintViolationException e) {
            return buildValidationErrorResponse(e.getConstraintViolations());
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }

    @PATCH
    @Path("/{id}/status")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateSubscriptionStatus(@PathParam("id") int id, Map<String, String> statusMap) {
        try {
            Subscription existing = service.findById(id);
            if (existing != null) {
                String newStatus = statusMap.get("status");
                if (newStatus != null && isValidStatus(newStatus)) {
                    existing.setStatus(Subscription.SubscriptionStatus.valueOf(newStatus));
                    Subscription updated = service.update(existing);
                    return Response.ok(toDTO(updated)).build();
                } else {
                    return Response.status(Response.Status.BAD_REQUEST)
                            .entity("{\"error\":\"Invalid status value\"}")
                            .build();
                }
            }
            return Response.status(Response.Status.NOT_FOUND).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }

    private boolean isValidStatus(String status) {
        try {
            Subscription.SubscriptionStatus.valueOf(status);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteSubscription(@PathParam("id") int id) {
        Subscription existing = service.findById(id);
        if (existing != null) {
            service.delete(id);
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }

    @GET
    @Path("/stats")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getStats() {
        Map<String, Long> stats = new HashMap<>();

        stats.put("totalUsers", service.getTotalUsers());
        stats.put("liteCount", service.getSubscriptionCount("lite"));
        stats.put("basicCount", service.getSubscriptionCount("basic"));
        stats.put("superCount", service.getSubscriptionCount("super"));

        return Response.ok(stats).build();
    }

    private SubscriptionDTO toDTO(Subscription sub) {
        return new SubscriptionDTO(
                sub.getId(),
                sub.getFirstname(),
                sub.getLastname(),
                sub.getEmail(),
                sub.getPhonenumber(),
                sub.getSubscription(),
                sub.getServices(),
                sub.getStatus()
        );
    }

    private Subscription toEntity(SubscriptionDTO dto) {
        Subscription subscription = new Subscription(
                dto.getFirstname(),
                dto.getLastname(),
                dto.getEmail(),
                dto.getPhonenumber(),
                dto.getSubscription(),
                dto.getServices(),
                dto.getStatus() != null ? dto.getStatus() : Subscription.SubscriptionStatus.Pending
        );
        if (dto.getId() > 0) {
            subscription.setId(dto.getId());
        }
        return subscription;
    }

    private Response buildValidationErrorResponse(Set<ConstraintViolation<?>> violations) {
        Map<String, String> errors = new HashMap<>();
        for (ConstraintViolation<?> v : violations) {
            String field = v.getPropertyPath().toString();
            errors.put(field, v.getMessage());
        }
        return Response.status(Response.Status.BAD_REQUEST)
                .entity(errors)
                .type(MediaType.APPLICATION_JSON)
                .build();
    }
}