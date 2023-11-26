import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { PrismaClient } from "@prisma/client";
import JsonWebToken from "jsonwebtoken";

export default class UsersController {
  public async register({ request, response }: HttpContextContract) {
    const prisma = new PrismaClient();

    const data = request.body();

    if (!data) {
      return response.status(400).json({ error: "No data provided" });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });

    return response.status(200).json({ message: "User created", user });
  }

  public async login({ request, response }: HttpContextContract) {
    const prisma = new PrismaClient();

    const data = request.body();

    if (!data) {
      return response.status(400).json({ error: "No data provided" });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      return response.status(400).json({ error: "User not found" });
    }

    if (user.password !== data.password) {
      return response.status(400).json({ error: "Invalid password" });
    }

    const token = JsonWebToken.sign({ id: user.id }, process.env.jwtSecret);

    return response.status(200).json({ message: "User logged in", token });
  }

  public async authorizationJWT({ request, response }: HttpContextContract) {
    // get the jwt, validate and verify the role of the user is admin
    const token = request.header("authorization");

    if (!token) {
      return response.status(401).json({ error: "No token provided" });
    }

    const decoded = JsonWebToken.verify(token, process.env.jwtSecret);

    if (!decoded) {
      return response.status(401).json({ error: "Invalid token" });
    }

    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return response.status(401).json({ error: "Invalid Token" });
    }

    if (user.role !== "ADMIN") {
      return response
        .status(401)
        .json({ error: "You don't have permission to access this resource" });
    }

    return response.status(200).json({ message: "Authorized" });
  }
}
