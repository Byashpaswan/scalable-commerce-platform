import amqp, { Connection, Channel } from 'amqplib';

export class RabbitMQService {
  private static connection: Connection | null = null;
  private static channel: Channel | null = null;

  public static async connect(): Promise<void> {
    if (this.connection) return;

    const uri = process.env.RABBITMQ_URI || 'amqp://localhost:5672';
    try {
      this.connection = await amqp.connect(uri);
      this.channel = await this.connection.createChannel();
      console.log('Connected to RabbitMQ successfully in Notification Service');
      
      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error in Notification Service:', err);
        this.connection = null;
        this.channel = null;
      });

      this.connection.on('close', () => {
        console.warn('RabbitMQ connection closed. Reconnecting...');
        this.connection = null;
        this.channel = null;
        setTimeout(() => this.connect(), 5000);
      });
      
    } catch (err) {
      console.error('Failed to connect to RabbitMQ in Notification Service:', err);
      setTimeout(() => this.connect(), 5000);
    }
  }

  public static async subscribe(
    queue: string,
    exchange: string,
    routingKey: string,
    callback: (message: any, rawMsg: amqp.ConsumeMessage) => void
  ): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }
      if (!this.channel) return;

      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.bindQueue(queue, exchange, routingKey);

      await this.channel.consume(queue, (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            callback(content, msg);
            this.channel?.ack(msg);
          } catch (err) {
            console.error('Error processing consumed message in Notification Service:', err);
            this.channel?.nack(msg, false, false);
          }
        }
      });
    } catch (err) {
      console.error(`Failed to subscribe to queue ${queue}:`, err);
    }
  }
}
