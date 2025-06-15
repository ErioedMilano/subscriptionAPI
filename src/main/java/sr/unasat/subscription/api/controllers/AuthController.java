package sr.unasat.subscription.api.controllers;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import sr.unasat.subscription.api.dto.UserDTO;
import sr.unasat.subscription.api.entity.User;
import sr.unasat.subscription.api.services.UserService;

@Path("/auth")
public class AuthController {
    private final UserService userService = new UserService();

    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(UserDTO userDTO) {
        User user = userService.authenticate(
                userDTO.getUsername(),
                userDTO.getPassword()
        );

        if (user != null) {
            return Response.ok().build();
        }
        return Response.status(Response.Status.UNAUTHORIZED).build();
    }
}