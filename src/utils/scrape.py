import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import time
import random

def get_weather_data(month, year):
    """
    Scrape weather data for a specific month and year
    """
    # Format the URL
    base_url = "https://weatherandclimate.com/baringo"
    url = f"{base_url}/{month.lower()}-{year}"
    
    try:
        # Add headers to mimic browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Make the request
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Parse the HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the title that indicates the daily observations table
        table_title = soup.find(string=lambda text: text and f"{month} {year} - Daily Observations" in text)
        
        if table_title:
            # Find the closest table to this title
            table = table_title.find_next('table')
            
            if table:
                # Extract table data
                data = []
                rows = table.find_all('tr')
                
                # Get headers from first row
                headers = [th.text.strip() for th in rows[0].find_all(['th', 'td'])]
                
                # Process remaining rows
                for row in rows[1:]:
                    cols = row.find_all('td')
                    if cols:
                        row_data = {}
                        for i, col in enumerate(cols):
                            header = headers[i] if i < len(headers) else f'Column_{i}'
                            row_data[header] = col.text.strip()
                        
                        # Add month and year
                        row_data['Month'] = month
                        row_data['Year'] = year
                        
                        data.append(row_data)
                
                df = pd.DataFrame(data)
                print(f"Successfully scraped {len(data)} records for {month} {year}")
                return df
            
        print(f"No table found for {month} {year}")
        return None
    
    except Exception as e:
        print(f"Error scraping data for {month} {year}: {str(e)}")
        return None



def clean_data(df):
    """
    Clean and format the scraped data
    """
    if df is None or df.empty:
        return None
    
    # Create a copy of the dataframe
    df = df.copy()
    
    # Rename columns to remove spaces and standardize names
    df.columns = [col.replace(' ', '_').lower() for col in df.columns]
    
    # Convert month names to month numbers
    month_map = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4,
        'May': 5, 'June': 6, 'July': 7, 'August': 8,
        'September': 9, 'October': 10, 'November': 11, 'December': 12
    }
    df['month_num'] = df['month'].map(month_map)
    
    # Construct datetime from components
    try:
        # df['time'] = pd.to_datetime(
        #     df['year'].astype(str) + '-' + 
        #     df['month_num'].astype(str).str.zfill(2) + '-' + 
        #     df['time'].astype(str).str.zfill(2)
        # )
        df['time'] = pd.to_datetime(df['time'], format='%Y-%m-%d', errors='coerce')
    except Exception as e:
        print(f"Error converting to datetime: {e}")
        return None
    
    # Remove any °C, %, km/h, etc. from values and convert to numeric
    numeric_columns = ['temperature', 'dew_point', 'humidity', 'wind_speed', 'pressure', 'precipitation']
    for col in numeric_columns:
        if col in df.columns:
            # Keep original value in new column
            df[f'{col}_raw'] = df[col]
            # Extract numeric value
            df[col] = df[col].str.extract(r'([-\d.]+)').astype(float)
    
    # Drop intermediate columns
    df = df.drop(['month_num'], axis=1)
    
    return df

def main():
    # Define months and years
    months = ['January', 'February', 'March', 'April', 'May', 'June', 
              'July', 'August', 'September', 'October', 'November', 'December']
    years = range(2010, 2021)  # 2010 to 2020
    # months = ['January', 'February', 'March']
    
    # Initialize empty list to store all data
    all_data = []
    
    # Loop through each year and month
    for year in years:
        for month in months:
            print(f"Scraping data for {month} {year}...")
            
            # Get data for current month/year
            df = get_weather_data(month, year)
            
            if df is not None:
                # Clean the data
                cleaned_df = clean_data(df)
                if cleaned_df is not None:
                    all_data.append(cleaned_df)
            
            # Add delay to avoid overwhelming the server
            time.sleep(random.uniform(2, 4))
    
    # Combine all data into one DataFrame
    if all_data:
        final_df = pd.concat(all_data, ignore_index=True)
        
        # Sort by date
        final_df = final_df.sort_values('time')
        
        # Select and reorder columns
        columns = ['time', 'temperature', 'dew_point', 
                  'humidity', 'wind_speed', 'pressure', 'precipitation']
        
        # Add raw columns if they exist
        raw_columns = [col for col in final_df.columns if col.endswith('_raw')]
        columns.extend(raw_columns)
        
        # Select only columns that exist in the DataFrame
        existing_columns = [col for col in columns if col in final_df.columns]
        final_df = final_df[existing_columns]
        
        # Save to CSV
        output_file = '5-baringo_weather_data_2010_2020.csv'
        final_df.to_csv(output_file, index=False)
        print(f"Data successfully scraped and saved to {output_file}!")
        
        # Print sample of data
        print("\nFirst few rows of scraped data:")
        print(final_df.head())
        
        # Print data info
        print("\nDataset Information:")
        print(final_df.info())
    else:
        print("No data was successfully scraped.")

if __name__ == "__main__":
    main()