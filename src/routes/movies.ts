import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, ilike, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { avmovie } from '../db/schema';
import {
  CreateMovieRequest,
  UpdateMovieRequest,
  PaginationQuery,
  SearchQuery,
  ApiResponse,
  MovieResponse
} from '../types';

export default async function moviesRoutes(fastify: FastifyInstance) {
  // Create a new movie
  fastify.post<{ Body: CreateMovieRequest }>('/movies', {
    schema: {
      body: {
        type: 'object',
        required: ['code', 'title'],
        properties: {
          code: { type: 'string' },
          title: { type: 'string' },
          magnet_link: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: CreateMovieRequest }>, reply: FastifyReply) => {
    try {
      const { code, title, magnet_link } = request.body;

      // Check if movie with this code already exists
      const existingMovie = await db.select().from(avmovie).where(eq(avmovie.code, code)).limit(1);

      if (existingMovie.length > 0) {
        return reply.status(409).send({
          success: false,
          message: 'Movie with this code already exists'
        } as ApiResponse<null>);
      }

      const newMovie = await db.insert(avmovie).values({
        code,
        title,
        magnet_link,
        updated_at: new Date()
      }).returning();

      return reply.status(201).send({
        success: true,
        data: newMovie[0],
        message: 'Movie created successfully'
      } as ApiResponse<MovieResponse>);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      } as ApiResponse<null>);
    }
  });

  // Get all movies with pagination
  fastify.get<{ Querystring: PaginationQuery }>('/movies', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: PaginationQuery }>, reply: FastifyReply) => {
    try {
      const { page = 1, limit = 10 } = request.query;
      const offset = (page - 1) * limit;

      const [moviesList, totalCount] = await Promise.all([
        db.select().from(avmovie).orderBy(desc(avmovie.created_at)).limit(limit).offset(offset),
        db.select({ count: avmovie.code }).from(avmovie)
      ]);

      const totalPages = Math.ceil(totalCount.length / limit);

      return reply.send({
        success: true,
        data: moviesList,
        pagination: {
          page,
          limit,
          total: totalCount.length,
          totalPages
        }
      } as ApiResponse<MovieResponse[]>);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      } as ApiResponse<null>);
    }
  });

  // Get movie by code
  fastify.get<{ Params: { code: string } }>('/movies/:code', {
    schema: {
      params: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) => {
    try {
      const { code } = request.params;

      const movie = await db.select().from(avmovie).where(eq(avmovie.code, code)).limit(1);
      
      if (movie.length === 0) {
        return reply.status(404).send({
          success: false,
          message: 'Movie not found'
        } as ApiResponse<null>);
      }

      return reply.send({
        success: true,
        data: movie[0]
      } as ApiResponse<MovieResponse>);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      } as ApiResponse<null>);
    }
  });

  // Update movie by code
  fastify.put<{ Params: { code: string }, Body: UpdateMovieRequest }>('/movies/:code', async (request: FastifyRequest<{ Params: { code: string }, Body: UpdateMovieRequest }>, reply: FastifyReply) => {
    try {
      const { code } = request.params;
      const updateData = request.body;

      // Check if movie exists
      const existingMovie = await db.select().from(avmovie).where(eq(avmovie.code, code)).limit(1);

      if (existingMovie.length === 0) {
        return reply.status(404).send({
          success: false,
          message: 'Movie not found'
        } as ApiResponse<null>);
      }

      const updatedMovie = await db.update(avmovie)
        .set({
          ...updateData,
          updated_at: new Date()
        })
        .where(eq(avmovie.code, code))
        .returning();

      return reply.send({
        success: true,
        data: updatedMovie[0],
        message: 'Movie updated successfully'
      } as ApiResponse<MovieResponse>);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      } as ApiResponse<null>);
    }
  });

  // Delete movie by code
  fastify.delete<{ Params: { code: string } }>('/movies/:code', async (request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) => {
    try {
      const { code } = request.params;

      // Check if movie exists
      const existingMovie = await db.select().from(avmovie).where(eq(avmovie.code, code)).limit(1);

      if (existingMovie.length === 0) {
        return reply.status(404).send({
          success: false,
          message: 'Movie not found'
        } as ApiResponse<null>);
      }

      await db.delete(avmovie).where(eq(avmovie.code, code));

      return reply.send({
        success: true,
        message: 'Movie deleted successfully'
      } as ApiResponse<null>);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      } as ApiResponse<null>);
    }
  });

  // Search movies by code
  fastify.get<{ Querystring: SearchQuery }>('/movies/search', async (request: FastifyRequest<{ Querystring: SearchQuery }>, reply: FastifyReply) => {
    try {
      const { code } = request.query;

      if (!code) {
        return reply.status(400).send({
          success: false,
          message: 'Code parameter is required'
        } as ApiResponse<null>);
      }

      const searchResults = await db.select()
        .from(avmovie)
        .where(ilike(avmovie.code, `%${code}%`))
        .orderBy(desc(avmovie.created_at));

      return reply.send({
        success: true,
        data: searchResults
      } as ApiResponse<MovieResponse[]>);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      } as ApiResponse<null>);
    }
  });
}
