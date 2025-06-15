// app/api/data-validation/[orderId]/route.ts
import { storeOrderData } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  // Extract the order ID from route parameters
  const orderId = params.orderId;
  
  // Extract size from URL query parameters
  const { searchParams } = new URL(request.url);
  let size = searchParams.get('size') || 'INVALID'
  size = size.toUpperCase(); 
  
  // Get the data from the request body
  const requestData = await request.json();

  try {
    // Extract data from the callback request
    const email = requestData.requestedInfo.email;
    const physicalAddress = requestData.requestedInfo.physicalAddress;

    console.log(`Processing data for order: ${orderId}`);
    console.log('Email:', email);
    console.log('Address:', physicalAddress);
    console.log('Size:', size);

    // Validate data
    const errors: Record<string, any> = {};
    if (!email || !email.includes('@')) {
      errors.email = "Valid email is required";
    }
    
    const addressData = physicalAddress.physicalAddress || physicalAddress;
    
    if (!addressData || !addressData.address1 || !addressData.city) {
      errors.address = "Complete shipping address is required";
    }

    // Add size validation
    if (!['S', 'M', 'L'].includes(size)) {
      errors.size = "Size must be S, M, or L";
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      console.error(`Validation errors for order ${orderId}:`, errors);
      return Response.json({ errors });
    }

    // Store data in the database using the orderId
    await storeOrderData(orderId, email, physicalAddress, size);
    console.log(`Successfully stored data for order: ${orderId}`);

    // If all validations pass, return success
    return Response.json({
      orderId,
      request: {
        calls: requestData.calls,
        chainId: requestData.chainId,
        capabilities: requestData.capabilities
      }
    });
  } catch (error) {
    console.error(`Error processing data validation for order ${orderId}:`, error);
    return Response.json({
      errors: {
        server: "Server error validating data",
      },
    });
  }
}
