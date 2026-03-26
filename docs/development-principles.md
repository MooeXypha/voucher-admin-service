# Development Principles

> **Note:** This document outlines guidances behind some development decisions
> behind this application.

## Minimal configuration

Running the API locally or in the cloud should require minimal to no
configuration unless absolutely necessary to run critical parts of the API.

Configuration that takes multiple steps, especially such as creating service
accounts should be avoided.

## App must work well outside cloud infrastructure

The API application should work reasonably well when it is not deployed to
cloud services. The experience of running the application locally or in the
cloud should be close.

For example:

- The logging library prints the logs to stdout when it cannot connect to cloud logging services.
- Application tries connecting to cloud services multiple times, eventually gives up.

## Running in the cloud must not reduce functionality

Running the API in the cloud must not reduce/lose any of the capabilities
developers have when running locally.

For example: Logs should still be printed to stdout/stderr even though logs
are uploaded to [Axiom](https://axiom.co) Logging when on AWS, so that
developers can stream "system logs" to diagnose each container.

## Module implementations should not be complex

Each module should provide a minimal implementation and try to avoid
unnecessary code and logic that's not executed.

Keep in mind that any module implementation is a decent example of “a REST
application that runs in container”. Keeping the source code short and
navigable will serve this purpose.

It is okay to have intentional inefficiencies in the code as they help
illustrate the capabilities of profiling and diagnostics offerings.
