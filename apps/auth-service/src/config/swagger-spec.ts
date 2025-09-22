export const swaggerDocument = {
  "openapi": "3.0.0",
  "info": {
    "title": "Auth Service API",
    "version": "1.0.0",
    "description": "API documentation for Auth Service"
  },
  "servers": [
    {
      "url": "http://localhost:6001/api/v1",
      "description": "Development server"
    }
  ],
  "components": {
    "securitySchemes": {
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    },
    "schemas": {
      "InviteUserRequest": {
        "type": "object",
        "required": ["email"],
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "description": "User email address",
            "example": "user1@example.com"
          }
        }
      },
      "InviteUserResponse": {
        "type": "object",
        "properties": {
          "message": {
            "type": "string",
            "description": "Success message",
            "example": "User invited successfully"
          }
        }
      },
      "ErrorResponse": {
        "type": "object",
        "properties": {
          "error": {
            "type": "string",
            "description": "Error message"
          },
          "path": {
            "type": "string",
            "description": "Request path"
          },
          "method": {
            "type": "string",
            "description": "HTTP method"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time",
            "description": "Timestamp of the error"
          }
        }
      }
    }
  },
  "paths": {
    "/auth/invite-user": {
      "post": {
        "tags": ["Authentication"],
        "summary": "Invite a user",
        "description": "Send an invitation to a user via email",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/InviteUserRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InviteUserResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    }
  }
};