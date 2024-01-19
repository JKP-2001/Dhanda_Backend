<div align="center">

# Api Documentation for Mock Interview Page:
</div>

## Endpoints:-

### 1. **Get List of Interviewers**
- Get the list of interviewers based on criteria
- URL 
  ```http
  GET /api/get-interviewers
  ```
- Query Parameters for fetching list of interviewers

  | Parameter | Values | Required | Description | Default |
    | :--- | :--- | :--- | :--- | :---|
  | `company` | `all/<company-name>` | **false** | The company interviewer works on | all
  | `sort-by` | `company/date/rating` | **false** | sort by parameter | rating
  