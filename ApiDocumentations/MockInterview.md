<div align="center">

# Api Documentation for Mock Interview Page:
</div>

## Endpoints:-

### 1. **Get List of Interviewers**
- Get the list of interviewers based on criteria
- URL 
  ```http
  GET /interviewers/all
  ```
- Query Parameters for fetching list of interviewers

  | Parameter | Values | Required | Description | Default |
    | :--- | :--- | :--- | :--- | :---|
  | `company` | `all/<company-name>` | **false** | The company interviewer works on | all
  | `sortBy` | `rating/interviewsTaken/priceHtl/priceLth` | **false** | sort by parameter | rating
   | `page` | `Integer` | **false** |  | 1
   | `limit` | `Integer` | **false** |  | \<Length of entire result>
    | `category` | `sde/dataScience/analyst/all` | **false** |  | all