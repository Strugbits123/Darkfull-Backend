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
      "InviteStoreAdminRequest": {
        "type": "object",
        "required": ["email", "storeId", "storeName"],
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "description": "Store admin email address",
            "example": "merchant@example.com"
          },
          "firstName": {
            "type": "string",
            "description": "First name of the store admin",
            "example": "John"
          },
          "lastName": {
            "type": "string",
            "description": "Last name of the store admin",
            "example": "Doe"
          },
          "storeId": {
            "type": "string",
            "description": "Store ID to associate with the admin",
            "example": "store_123"
          },
          "storeName": {
            "type": "string",
            "description": "Name of the store",
            "example": "John's Electronics Store"
          }
        }
      },
      "InviteStoreAdminResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": true
          },
          "message": {
            "type": "string",
            "example": "Store Admin invitation sent successfully"
          },
          "data": {
            "type": "object",
            "properties": {
              "invitation": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "example": "inv_123"
                  },
                  "email": {
                    "type": "string",
                    "example": "merchant@example.com"
                  },
                  "role": {
                    "type": "string",
                    "example": "STORE_ADMIN"
                  },
                  "storeName": {
                    "type": "string",
                    "example": "John's Electronics Store"
                  },
                  "expiresAt": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-09-28T12:00:00.000Z"
                  }
                }
              }
            }
          }
        }
      },
      "ValidateInvitationResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": true
          },
          "message": {
            "type": "string",
            "example": "Invitation token is valid"
          },
          "data": {
            "type": "object",
            "properties": {
              "invitation": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "example": "inv_123"
                  },
                  "email": {
                    "type": "string",
                    "example": "merchant@example.com"
                  },
                  "role": {
                    "type": "string",
                    "example": "STORE_ADMIN"
                  },
                  "store": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "example": "store_123"
                      },
                      "name": {
                        "type": "string",
                        "example": "John's Electronics Store"
                      },
                      "slug": {
                        "type": "string",
                        "example": "johns-electronics-store"
                      }
                    }
                  },
                  "inviter": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "example": "user_456"
                      },
                      "fullName": {
                        "type": "string",
                        "example": "Super Admin"
                      },
                      "email": {
                        "type": "string",
                        "example": "admin@darkhorse3pl.com"
                      }
                    }
                  },
                  "expiresAt": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-09-28T12:00:00.000Z"
                  }
                }
              }
            }
          }
        }
      },
      "AcceptInvitationRequest": {
        "type": "object",
        "required": ["token", "password", "firstName", "lastName"],
        "properties": {
          "token": {
            "type": "string",
            "description": "Invitation token",
            "example": "abc123def456ghi789"
          },
          "password": {
            "type": "string",
            "minLength": 8,
            "description": "User password (minimum 8 characters)",
            "example": "SecurePassword123"
          },
          "firstName": {
            "type": "string",
            "description": "First name",
            "example": "John"
          },
          "lastName": {
            "type": "string",
            "description": "Last name",
            "example": "Doe"
          },
          "phone": {
            "type": "string",
            "description": "Phone number (optional)",
            "example": "+1234567890"
          }
        }
      },
      "AcceptInvitationResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": true
          },
          "message": {
            "type": "string",
            "example": "Invitation accepted successfully"
          },
          "data": {
            "type": "object",
            "properties": {
              "user": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "example": "user_789"
                  },
                  "email": {
                    "type": "string",
                    "example": "merchant@example.com"
                  },
                  "firstName": {
                    "type": "string",
                    "example": "John"
                  },
                  "lastName": {
                    "type": "string",
                    "example": "Doe"
                  },
                  "fullName": {
                    "type": "string",
                    "example": "John Doe"
                  },
                  "role": {
                    "type": "string",
                    "example": "STORE_ADMIN"
                  },
                  "status": {
                    "type": "string",
                    "example": "ACTIVE"
                  },
                  "store": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "example": "store_123"
                      },
                      "name": {
                        "type": "string",
                        "example": "John's Electronics Store"
                      },
                      "slug": {
                        "type": "string",
                        "example": "johns-electronics-store"
                      }
                    }
                  },
                  "createdAt": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-09-25T12:00:00.000Z"
                  }
                }
              },
              "session": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "example": "session_456"
                  },
                  "expiresAt": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-09-26T12:00:00.000Z"
                  }
                }
              },
              "tokens": {
                "type": "object",
                "properties": {
                  "accessToken": {
                    "type": "string",
                    "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  },
                  "refreshToken": {
                    "type": "string",
                    "example": "refresh_token_here"
                  },
                  "accessTokenExpiresAt": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-09-25T13:00:00.000Z"
                  },
                  "refreshTokenExpiresAt": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-10-02T12:00:00.000Z"
                  }
                }
              }
            }
          }
        }
      },
      "LoginRequest": {
        "type": "object",
        "required": ["email", "password"],
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "description": "User email address",
            "example": "merchant@example.com"
          },
          "password": {
            "type": "string",
            "description": "User password",
            "example": "SecurePassword123"
          },
          "rememberMe": {
            "type": "boolean",
            "description": "Remember me option",
            "example": false
          }
        }
      },
      "LoginResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": true
          },
          "message": {
            "type": "string",
            "example": "Login successful"
          },
          "data": {
            "type": "object",
            "properties": {
              "user": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "example": "user_789"
                  },
                  "email": {
                    "type": "string",
                    "example": "merchant@example.com"
                  },
                  "fullName": {
                    "type": "string",
                    "example": "John Doe"
                  },
                  "status": {
                    "type": "string",
                    "example": "ACTIVE"
                  },
                  "role": {
                    "type": "string",
                    "example": "STORE_ADMIN"
                  },
                  "storeId": {
                    "type": "string",
                    "example": "store_123"
                  },
                  "warehouseId": {
                    "type": "string",
                    "nullable": true,
                    "example": null
                  },
                  "store": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "example": "store_123"
                      },
                      "name": {
                        "type": "string",
                        "example": "John's Electronics Store"
                      },
                      "slug": {
                        "type": "string",
                        "example": "johns-electronics-store"
                      }
                    }
                  },
                  "createdAt": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-09-25T12:00:00.000Z"
                  }
                }
              },
              "session": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "example": "session_456"
                  },
                  "expiresAt": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-09-26T12:00:00.000Z"
                  },
                  "deviceInfo": {
                    "type": "string",
                    "example": "Mozilla/5.0..."
                  },
                  "ipAddress": {
                    "type": "string",
                    "example": "192.168.1.1"
                  },
                  "userAgent": {
                    "type": "string",
                    "example": "Mozilla/5.0..."
                  },
                  "platform": {
                    "type": "string",
                    "example": "web"
                  }
                }
              },
              "tokens": {
                "type": "object",
                "properties": {
                  "accessToken": {
                    "type": "string",
                    "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  },
                  "refreshToken": {
                    "type": "string",
                    "example": "refresh_token_here"
                  },
                  "accessTokenExpiresAt": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-09-25T13:00:00.000Z"
                  },
                  "refreshTokenExpiresAt": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-10-02T12:00:00.000Z"
                  }
                }
              }
            }
          }
        }
      },
      "ErrorResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": false
          },
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
      },
      "CreateStoreRequest": {
        "type": "object",
        "required": ["name", "slug"],
        "properties": {
          "name": {
            "type": "string",
            "description": "Store name",
            "example": "Ahmed's Electronics Store"
          },
          "slug": {
            "type": "string",
            "description": "Store slug (URL-friendly identifier)",
            "example": "ahmeds-electronics-store"
          }
        }
      },
      "UpdateStoreRequest": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Store name",
            "example": "Ahmed's Updated Electronics Store"
          },
          "slug": {
            "type": "string",
            "description": "Store slug (URL-friendly identifier)",
            "example": "ahmeds-updated-electronics-store"
          }
        }
      },
      "StoreResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": true
          },
          "message": {
            "type": "string",
            "example": "Store operation completed successfully"
          },
          "data": {
            "type": "object",
            "properties": {
              "store": {
                "$ref": "#/components/schemas/Store"
              }
            }
          }
        }
      },
      "StoreListResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": true
          },
          "message": {
            "type": "string",
            "example": "Stores retrieved successfully"
          },
          "data": {
            "type": "object",
            "properties": {
              "stores": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Store"
                }
              },
              "pagination": {
                "$ref": "#/components/schemas/Pagination"
              }
            }
          }
        }
      },
      "Store": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "store_123"
          },
          "name": {
            "type": "string",
            "example": "Ahmed's Electronics Store"
          },
          "slug": {
            "type": "string",
            "example": "ahmeds-electronics-store"
          },
          "isActive": {
            "type": "boolean",
            "example": true
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "example": "2025-09-26T12:00:00.000Z"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "example": "2025-09-26T12:00:00.000Z"
          },
          "sallaConnectedAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true,
            "example": null
          },
          "creator": {
            "$ref": "#/components/schemas/User"
          },
          "stats": {
            "type": "object",
            "properties": {
              "totalUsers": {
                "type": "integer",
                "example": 5
              },
              "totalWarehouses": {
                "type": "integer",
                "example": 2
              },
              "pendingInvitations": {
                "type": "integer",
                "example": 1
              }
            }
          }
        }
      },
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "user_123"
          },
          "fullName": {
            "type": "string",
            "example": "Super Admin"
          },
          "email": {
            "type": "string",
            "example": "admin@darkhorse3pl.com"
          }
        }
      },
      "Pagination": {
        "type": "object",
        "properties": {
          "currentPage": {
            "type": "integer",
            "example": 1
          },
          "totalPages": {
            "type": "integer",
            "example": 5
          },
          "totalCount": {
            "type": "integer",
            "example": 47
          },
          "limit": {
            "type": "integer",
            "example": 10
          },
          "hasNextPage": {
            "type": "boolean",
            "example": true
          },
          "hasPreviousPage": {
            "type": "boolean",
            "example": false
          }
        }
      }
    }
  },
  "paths": {
    "/auth/invitations/store-admin": {
      "post": {
        "tags": ["Authentication - Invitations"],
        "summary": "Invite Store Admin",
        "description": "Super Admin invites a Store Admin to manage a specific store",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/InviteStoreAdminRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Store Admin invitation sent successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InviteStoreAdminResponse"
                }
              }
            }
          }
        }
      }
    },
    "/auth/invitations/validate/{token}": {
      "get": {
        "tags": ["Authentication - Invitations"],
        "summary": "Validate Invitation Token",
        "description": "Validate an invitation token and return invitation details",
        "parameters": [
          {
            "name": "token",
            "in": "path",
            "required": true,
            "description": "Invitation token to validate",
            "schema": {
              "type": "string",
              "example": "abc123def456ghi789"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Invitation token is valid",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ValidateInvitationResponse"
                }
              }
            }
          }
        }
      }
    },
    "/auth/invitations/accept": {
      "post": {
        "tags": ["Authentication - Invitations"],
        "summary": "Accept Invitation",
        "description": "Accept an invitation and create a new user account",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AcceptInvitationRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Invitation accepted successfully, user account created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AcceptInvitationResponse"
                }
              }
            }
          },

        }
      }
    },
    "/auth/login": {
      "post": {
        "tags": ["Authentication - Login"],
        "summary": "User Login",
        "description": "Authenticate user with email and password",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login successful",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginResponse"
                }
              }
            }
          },

        }
      }
    },
    "/auth/salla/connect": {
      "post": {
        "tags": ["Authentication - Salla Integration"],
        "summary": "Connect Salla Store",
        "description": "Store Admin initiates Salla OAuth connection by providing credentials",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "sallaClientId": {
                    "type": "string",
                    "description": "Salla OAuth Client ID",
                    "example": "your_salla_client_id"
                  },
                  "sallaClientSecret": {
                    "type": "string",
                    "description": "Salla OAuth Client Secret", 
                    "example": "your_salla_client_secret"
                  }
                },
                "required": ["sallaClientId", "sallaClientSecret"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Salla connection initiated, redirect to authorization URL",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Salla connection initiated successfully. Please complete authorization via the provided URL."
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "store": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "store_123"
                            },
                            "name": {
                              "type": "string",
                              "example": "Ahmed's Electronics Store"
                            },
                            "sallaClientId": {
                              "type": "string",
                              "example": "your_salla_client_id"
                            }
                          }
                        },
                        "authorizationUrl": {
                          "type": "string",
                          "description": "Salla OAuth authorization URL to redirect user to",
                          "example": "https://accounts.salla.sa/oauth2/auth?client_id=..."
                        },
                        "state": {
                          "type": "string",
                          "description": "OAuth state parameter for security",
                          "example": "abc123def456..."
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/auth/salla/callback": {
      "get": {
        "tags": ["Authentication - Salla Integration"],
        "summary": "Salla OAuth Callback",
        "description": "Handle Salla OAuth callback and exchange authorization code for access tokens. No authentication required as this is called by Salla.",
        "parameters": [
          {
            "name": "code",
            "in": "query",
            "required": true,
            "description": "Authorization code from Salla",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "state",
            "in": "query",
            "required": true,
            "description": "State parameter for security validation",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Salla connection successful",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "access_token": {
                      "type": "string",
                      "description": "Salla access token"
                    },
                    "refresh_token": {
                      "type": "string",
                      "description": "Salla refresh token"
                    },
                    "expires_in": {
                      "type": "integer",
                      "description": "Token expiration time in seconds"
                    }
                  }
                }
              }
            }
          },

        }
      }
    },
    "/stores": {
      "post": {
        "tags": ["Store Management"],
        "summary": "Create Store",
        "description": "Super Admin creates a new store",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateStoreRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Store created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/StoreResponse"
                }
              }
            }
          }
        }
      },
      "get": {
        "tags": ["Store Management"],
        "summary": "List Stores",
        "description": "Get paginated list of all stores",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "description": "Page number",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "description": "Items per page",
            "schema": {
              "type": "integer",
              "default": 10
            }
          },
          {
            "name": "search",
            "in": "query",
            "description": "Search stores by name or slug",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "sortBy",
            "in": "query",
            "description": "Sort by field",
            "schema": {
              "type": "string",
              "enum": ["name", "createdAt", "updatedAt"],
              "default": "createdAt"
            }
          },
          {
            "name": "sortOrder",
            "in": "query",
            "description": "Sort order",
            "schema": {
              "type": "string",
              "enum": ["asc", "desc"],
              "default": "desc"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Stores retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/StoreListResponse"
                }
              }
            }
          }
        }
      }
    },
    "/stores/{id}": {
      "get": {
        "tags": ["Store Management"],
        "summary": "Get Store Details",
        "description": "Get detailed information about a specific store",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "Store ID",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Store details retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/StoreResponse"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": ["Store Management"],
        "summary": "Update Store",
        "description": "Update store information",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "Store ID",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateStoreRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Store updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/StoreResponse"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["Store Management"],
        "summary": "Delete Store",
        "description": "Delete a store (only if no users or warehouses exist)",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "Store ID",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Store deleted successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Store deleted successfully"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "deletedStore": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "store_123"
                            },
                            "name": {
                              "type": "string",
                              "example": "Ahmed's Electronics Store"
                            },
                            "slug": {
                              "type": "string",
                              "example": "ahmeds-electronics-store"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};