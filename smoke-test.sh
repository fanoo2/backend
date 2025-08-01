#!/bin/bash

# Smoke Test Script for Fanno AI Platform API
# Tests basic functionality using curl commands

set -e

API_BASE_URL="http://localhost:5000"
TIMEOUT=10

echo "🧪 Starting Smoke Tests for Fanno AI Platform API"
echo "================================================"

# Function to check if server is running
check_server() {
    echo "📡 Checking if server is running at $API_BASE_URL..."
    if curl -f -s --max-time $TIMEOUT "$API_BASE_URL/health" > /dev/null; then
        echo "✅ Server is running"
        return 0
    else
        echo "❌ Server is not responding"
        return 1
    fi
}

# Function to test health endpoint
test_health() {
    echo "🏥 Testing health endpoint..."
    
    response=$(curl -f -s --max-time $TIMEOUT "$API_BASE_URL/health")
    
    if echo "$response" | grep -q '"status":"healthy"'; then
        echo "✅ Health check passed"
        echo "   Response: $response"
    else
        echo "❌ Health check failed"
        echo "   Response: $response"
        return 1
    fi
}

# Function to test API health endpoint
test_api_health() {
    echo "🏥 Testing API health endpoint..."
    
    response=$(curl -f -s --max-time $TIMEOUT "$API_BASE_URL/api/health")
    
    if echo "$response" | grep -q '"status":"healthy"'; then
        echo "✅ API health check passed"
        echo "   Response: $response"
    else
        echo "❌ API health check failed"
        echo "   Response: $response"
        return 1
    fi
}

# Function to test stats endpoint
test_stats() {
    echo "📊 Testing stats endpoint..."
    
    response=$(curl -f -s --max-time $TIMEOUT "$API_BASE_URL/api/stats")
    
    if echo "$response" | grep -q '"activeAgents"'; then
        echo "✅ Stats endpoint working"
        echo "   Response: $response"
    else
        echo "❌ Stats endpoint failed"
        echo "   Response: $response"
        return 1
    fi
}

# Function to test annotation endpoint
test_annotation() {
    echo "🤖 Testing annotation endpoint..."
    
    response=$(curl -f -s --max-time $TIMEOUT \
        -H "Content-Type: application/json" \
        -d '{"text":"This is a test sentence for annotation."}' \
        "$API_BASE_URL/api/annotate")
    
    if echo "$response" | grep -q '"annotations"'; then
        echo "✅ Annotation endpoint working"
        echo "   Response: $response"
    else
        echo "❌ Annotation endpoint failed"
        echo "   Response: $response"
        return 1
    fi
}

# Function to test agents endpoint
test_agents() {
    echo "👥 Testing agents endpoint..."
    
    response=$(curl -f -s --max-time $TIMEOUT "$API_BASE_URL/api/agents")
    
    if [ "$response" = "[]" ] || echo "$response" | grep -q '\['; then
        echo "✅ Agents endpoint working"
        echo "   Response: $response"
    else
        echo "❌ Agents endpoint failed"
        echo "   Response: $response"
        return 1
    fi
}

# Function to test workflows endpoint  
test_workflows() {
    echo "🔄 Testing workflows endpoint..."
    
    response=$(curl -f -s --max-time $TIMEOUT "$API_BASE_URL/api/workflows")
    
    if [ "$response" = "[]" ] || echo "$response" | grep -q '\['; then
        echo "✅ Workflows endpoint working"
        echo "   Response: $response"
    else
        echo "❌ Workflows endpoint failed"
        echo "   Response: $response"
        return 1
    fi
}

# Function to test root endpoint
test_root() {
    echo "🏠 Testing root endpoint..."
    
    response=$(curl -f -s --max-time $TIMEOUT "$API_BASE_URL/")
    
    if echo "$response" | grep -q "Fanno AI Platform API"; then
        echo "✅ Root endpoint working"
        echo "   Response contains welcome page"
    else
        echo "❌ Root endpoint failed"
        echo "   Response: $response"
        return 1
    fi
}

# Main execution
main() {
    echo "Starting smoke tests at $(date)"
    echo ""
    
    # Check if server is running
    if ! check_server; then
        echo ""
        echo "❌ SMOKE TESTS FAILED: Server is not running"
        echo "   Please start the server with: npm run server"
        exit 1
    fi
    
    echo ""
    
    # Run all tests
    test_health
    echo ""
    
    test_api_health  
    echo ""
    
    test_root
    echo ""
    
    test_stats
    echo ""
    
    test_agents
    echo ""
    
    test_workflows
    echo ""
    
    test_annotation
    echo ""
    
    echo "================================================"
    echo "✅ ALL SMOKE TESTS PASSED!"
    echo "   Tested $(date)"
    echo "   Server: $API_BASE_URL"
    echo "================================================"
}

# Handle arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Smoke test script for Fanno AI Platform API"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --url URL      Override API base URL (default: http://localhost:5000)"
    echo ""
    echo "Examples:"
    echo "  $0                           # Test localhost:5000"
    echo "  $0 --url http://api.prod.com # Test production API"
    exit 0
fi

if [ "$1" = "--url" ] && [ -n "$2" ]; then
    API_BASE_URL="$2"
    echo "Using custom API URL: $API_BASE_URL"
fi

# Run main function
main