#!/bin/sh

# Start RabbitMQ in the background
echo "Starting RabbitMQ..."
rabbitmq-server &
SERVER_PID=$!

# Wait for the RabbitMQ application itself to be fully running
echo "Waiting for RabbitMQ to be fully booted..."
rabbitmqctl await_startup

# Start the rabbit app with retry
echo "Starting rabbit app..."
for i in 1 2 3 4 5; do
  if rabbitmqctl start_app; then
    echo "Rabbit app started successfully"
    break
  else
    echo "Attempt $i: Failed to start rabbit app, retrying..."
    sleep 2
  fi
done

# Wait for app to be fully ready
sleep 3

# Ensure the default virtual host exists
echo "Creating default virtual host..."
rabbitmqctl add_vhost / 2>/dev/null || echo "Virtual host / already exists"

# Set permissions for guest user
echo "Setting permissions..."
rabbitmqctl set_permissions -p / guest ".*" ".*" ".*" 2>/dev/null || echo "Permissions already set"

# Wait a bit for the vhost to be fully ready
sleep 2

# Try to import definitions first
echo "Importing definitions from definitions.json..."
rabbitmqadmin -u guest -p guest import /etc/rabbitmq/definitions.json 2>/dev/null

# Create/ensure queues exist using rabbitmqadmin
echo "Declaring queues..."
rabbitmqadmin -u guest -p guest -v / declare queue name=user_events_queue durable=true 2>/dev/null
rabbitmqadmin -u guest -p guest -v / declare queue name=task_queue durable=true 2>/dev/null
rabbitmqadmin -u guest -p guest -v / declare queue name=notification_queue durable=true 2>/dev/null

# Verify queues were created
echo "Verifying queues..."
rabbitmqctl list_queues -p / name durable

# Keep the container running by waiting for the RabbitMQ process
echo "RabbitMQ setup complete. Monitoring server..."
wait $SERVER_PID
