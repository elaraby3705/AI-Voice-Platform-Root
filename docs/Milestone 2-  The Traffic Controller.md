🛡️ Milestone 2: The Traffic Controller (API Gateway & Nginx Reverse Proxy)
🎯 Milestone Objective
The primary goal of this milestone is to transition the Nexus System from direct container exposure (exposing multiple ports like 5173, 8000, 8002) to a unified, secure entry point using a Reverse Proxy (Nginx). This architectural shift centralizes traffic management, enhances security at the edge, and isolates backend services within a private Docker network.

🏗️ Design Visualization (Advanced)
This dark-themed infographic provides a granular overview of the architectural transformation. It includes the before/after conceptual designs, advanced technical design (showing internal routing and isolated databases), and detailed CRC Cards for the newly introduced Nginx Gateway.

{image}

📋 Scope of Work & Completed Issues
Issue #6: Setup Nginx Service & Reverse Proxy Base
Description: Define the nginx service in docker-compose.yml to act as the primary Traffic Controller.

Completed Tasks:

[x] Defined the Nginx service with volumes for nginx.conf and SSL.

[x] Mapped host port 80 to the container.

[x] Nginx successfully serves static content.

Result: Infrastructure foundation is complete and listening for traffic.

Issue #7: WebSocket Tunneling & Routing Logic
Description: Migrate WebSocket routing from Vite Dev Proxy to the Nginx Gateway.

Completed Tasks:

[x] Updated nginx.conf to handle Upgrade and Connection headers (required for WebSockets).

[x] Routed all requests matching /ws/* to the realtime-api service (port 8002).

[x] Verified persistent connection stability.

[x] Disabled WebSocket proxying in vite.config.js.

Result: Real-time traffic is securely tunneled through the Gateway.

Issue #8: Centralized API Routing & CORS Configuration
Description: Consolidate API routing and move CORS management from individual microservices to Nginx.

Completed Tasks:

[x] Routed /api/v1/* to the core-api container (port 8000).

[x] Stripped CORS middleware from Django and FastAPI configurations.

[x] Centralized all Access-Control-Allow-Origin policies within nginx.conf.

Result: Single API entry point with standardized security policies.

Issue #9: Security Hardening: Rate Limiting & Headers
Description: Implement protection layers to prevent API abuse and secure the server signature.

Completed Tasks:

[x] Implemented limit_req_zone and limit_req in Nginx to apply global rate limiting.

[x] Configured secure HTTP headers (X-Content-Type-Options, X-Frame-Options, Content-Security-Policy).

[x] Verified Core API remains inaccessible except through Nginx.

Result: The application is protected against volumetric attacks and cross-site vulnerabilities.

Issue #10: SSL Termination (HTTPS/Certbot Integration)
Description: Enable production-grade encryption for all system traffic.

Completed Tasks:

[x] Integrated certbot container into the Docker stack.

[x] Configured Nginx to perform SSL termination.

[x] Implemented automated renewal logic for Let's Encrypt certificates.

[x] Enforced global 301 redirects from HTTP to HTTPS.

Result: Full transit encryption is enabled (https:// nexus.ai).

🛠️ Configuration Quick-Start (Upstream Verification)
To verify the configuration, use the following commands to check that the Nginx service can resolve and connect to its upstream targets within the Docker network.

Check Nginx Configuration Syntax:

Bash
docker exec -it ai_voice_gateway nginx -t
(Output should show syntax is ok and test is successful.)

Verify Core API (Django) Upstream:

Bash
docker exec -it ai_voice_gateway curl http://backend:8000/api/v1/health/
(Should return a JSON response {"status": "ok"}.)

Verify Real-Time API (FastAPI) Upstream:

Bash
docker exec -it ai_voice_gateway curl http://realtime-api:8002/health/
(Should return a JSON response {"service": "realtime-api", "status": "ok"}.)

🔄 Lifecycle: Standard UML Event Workflow
The workflow diagram visualizes how the Gateway handles a user request and propagates a real-time event. This demonstrates the Low Coupling (Nginx doesn't know DB logic) and High Cohesion (each service handles its own responsibility) principles.

Step 1: The Request: Client sends a HTTP POST /api/create_project.

Step 2: Nginx Gateway: Nginx receives, terminates SSL, checks CORS, and forwards the request to the Core API.

Step 3: Core API (Django): Django saves to PostgreSQL, triggers a Post-Save Signal.

Step 4: Event Broker (Redis): Django Signal publishes (events:projects) to Redis.

Step 5: Broadcast (FastAPI): Real-Time API subscribes to Redis, receives the event, and broadcasts it (PROJECT_CREATED) to connected dashboards.

📄 License
This milestone is part of the Nexus AI Voice Suite. Confidential and Proprietary.