import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { PrismaClient } from '@prisma/client'
import JsonWebToken from 'jsonwebtoken'

export default class ArduinosController {

    public async registerData({ request, response }: HttpContextContract) {

        const token = request.header('authorization')

        if (token !== process.env.arduinoToken) {

            return response.status(401).json({ error: 'Invalid token' })
        }

        const data = request.body()

        if (!data) {

            return response.status(400).json({ error: 'No data provided' })
        }

        return response.status(200).json({ message: 'Data received' })
    
    }

    public async registerIrrigationRequest({ request, response }: HttpContextContract) {
        // verify if user has admin role, if not, return error
        // if has, register the irrigation request

        const token = request.header('authorization')

        if (!token) {

            return response.status(401).json({ error: 'No token provided' })
        }

        const decoded = JsonWebToken.verify(token, process.env.jwtSecret)

        if (!decoded) {

            return response.status(401).json({ error: 'Invalid token' })
        }

        const prisma = new PrismaClient()

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        })

        if (!user) {

            return response.status(401).json({ error: 'User not found' })
        }

        if (user.role !== 'ADMIN') {

            return response.status(401).json({ error: 'You are not authorized to do this' })
        }

        // register the irrigation request

        const irrigationRequest = await prisma.irrigationRequest.create({
            data: {
                requestMadeByUserId: user.id,
                irrigationRequestTime: new Date(),
            }
        })

        return response.status(200).json({ message: 'Irrigation request registered', irrigationRequest })
    }

    public async getIrrigationRequests({ request, response }: HttpContextContract) {
        // verify if user has admin role, if not, return error
        // if has, return all irrigation requests

        const token = request.header('authorization')

        if (token !== process.env.arduinoToken) {

            return response.status(401).json({ error: 'No token provided' })
        }

        const prisma = new PrismaClient()

        const irrigationRequests = await prisma.irrigationRequest.findMany()

        return response.status(200).json({ message: 'Irrigation requests', irrigationRequests })
    }

    public async updateIrrigationRequest({ request, response }: HttpContextContract) {

        const token = request.header('authorization')

        if (token !== process.env.arduinoToken) {

            return response.status(401).json({ error: 'No token provided' })
        }

        const data = request.body()

        if (!data) {

            return response.status(400).json({ error: 'No data provided' })
        }

        const prisma = new PrismaClient()

        const irrigationRequest = await prisma.irrigationRequest.findUnique({
            where: {
                id: data.id
            }
        })

        if (!irrigationRequest) {

            return response.status(400).json({ error: 'Irrigation request not found' })
        }

        const updatedIrrigationRequest = await prisma.irrigationRequest.update({
            where: {
                id: irrigationRequest.id
            },
            data: {
                irrigationRequestTime: data.irrigationRequestTime
            }
        })

        return response.status(200).json({ message: 'Irrigation request updated', updatedIrrigationRequest })
    }

}
